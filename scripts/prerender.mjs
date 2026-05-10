#!/usr/bin/env node
/**
 * Post-build prerender step.
 *
 * Why this exists
 * ---------------
 * The site is a Vite SPA — out of the box every route is served the same
 * `dist/index.html`, which means Googlebot needs to JS-render before it sees
 * the page-specific title / description / JSON-LD. That delays indexing and
 * hurts rankings on competitive head terms.
 *
 * What this does
 * --------------
 *  1. Spins up `vite preview` against the freshly built `dist/` folder
 *  2. Drives Puppeteer through every SEO route listed below
 *  3. Saves each fully-rendered HTML to `dist/<route>/index.html`
 *
 * Vercel serves the prerendered file because static assets are matched
 * BEFORE the SPA-rewrite (see `vercel.json`), so the first-byte HTML the
 * crawler sees is the real, rendered page — title, meta, JSON-LD and all.
 *
 * The React app still hydrates on top of the prerendered HTML, so the live
 * UX is unchanged for human users.
 */
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import puppeteer from 'puppeteer';

const ROUTES = [
  '/',
  '/ai-interview-helper',
  '/online-interview-helper',
  '/mock-interview-ai',
  '/ai-resume-builder',
  '/ai-job-search',
  '/free-ai-interview-helper',
  '/google-meet-ai-interview-helper',
  '/microsoft-teams-ai-interview-helper',
  '/ai-interview-answer-generator',
  '/about',
  '/privacy',
  '/refund',
  '/alternatives',
  '/alternatives/final-round-ai-alternative',
  '/alternatives/lockedin-ai-alternative',
  '/alternatives/sensei-ai-alternative',
  '/alternatives/parakeet-ai-alternative',
  '/alternatives/beyz-ai-alternative',
  '/alternatives/interviews-chat-alternative',
  '/alternatives/aiapply-alternative',
  '/alternatives/live-interview-ai-alternative',
  '/compare/final-round-ai-vs-helplyai',
  '/compare/lockedin-ai-vs-helplyai',
  '/compare/sensei-ai-vs-helplyai',
  '/compare/parakeet-ai-vs-helplyai',
  '/blog/best-ai-interview-helper-tools',
  '/blog/online-interview-helper',
  '/blog/real-time-ai-interview-helper',
  '/blog/zoom-ai-interview-helper',
  '/blog/how-to-crack-interview',
  '/blog/ai-interview-tips',
  '/blog/star-method-guide',
  '/interview-prep/software-engineer',
  '/interview-prep/product-manager',
  '/interview-prep/data-science',
  '/interview-prep/finance',
  '/interview-prep/marketing',
  '/interview-prep/consulting',
  '/vs/final-round-ai',
  '/vs/lockedin-ai',
  '/vs/parakeet-ai',
  '/vs/hirin-ai',
  '/vs/uncharted-career',
];

const PREVIEW_PORT = 4477;
const DIST_DIR = path.resolve('dist');

const VITE_BIN = path.resolve('node_modules/.bin/vite');
/**
 * Local dev: prefer the user's installed Chrome (fast — Puppeteer's bundled
 * Chromium isn't installed locally because we don't want a 150MB download in
 * day-to-day workflow). On CI (Vercel) we install `puppeteer` with its bundled
 * Chromium and let Puppeteer pick the executable up automatically.
 */
const SYSTEM_CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const CHROME_PATH = (() => {
  if (process.env.PUPPETEER_EXECUTABLE_PATH) return process.env.PUPPETEER_EXECUTABLE_PATH;
  // Use bundled Chromium on CI (Linux). On macOS dev, prefer system Chrome.
  if (process.platform === 'darwin') return SYSTEM_CHROME;
  return undefined; // let Puppeteer auto-detect bundled Chromium
})();

function startPreview() {
  return new Promise((resolve, reject) => {
    const child = spawn(
      VITE_BIN,
      ['preview', '--host', '127.0.0.1', '--port', String(PREVIEW_PORT), '--strictPort'],
      { stdio: ['ignore', 'pipe', 'pipe'] },
    );
    let resolved = false;
    const ready = () => {
      if (!resolved) {
        resolved = true;
        resolve(child);
      }
    };
    child.stdout.on('data', (buf) => {
      const s = buf.toString();
      if (s.includes('Local:')) ready();
    });
    child.stderr.on('data', (buf) => {
      const s = buf.toString();
      if (s.includes('Local:')) ready();
    });
    child.on('exit', (code) => {
      if (!resolved) reject(new Error(`vite preview exited early (code=${code})`));
    });
    setTimeout(ready, 6000); // safety: assume ready after 6s
  });
}

async function waitForServer(url, timeoutMs = 10000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      /* not yet */
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error(`Preview server never came up at ${url}`);
}

async function renderRoute(browser, route) {
  const url = `http://127.0.0.1:${PREVIEW_PORT}${route}`;
  const page = await browser.newPage();
  try {
    await page.setViewport({ width: 1280, height: 900 });
    // Block third-party trackers so prerender output is clean and fast.
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const u = req.url();
      if (
        u.includes('googletagmanager.com') ||
        u.includes('google-analytics.com') ||
        u.includes('analytics.google.com')
      ) {
        return req.abort();
      }
      req.continue();
    });

    // domcontentloaded is enough — we don't want to wait for autoplaying videos
    // or background fetches. We then wait an extra second for SEOHead's effect
    // to mutate <head> with the per-route metadata + JSON-LD.
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    // Wait for the React app to mount and SEOHead to run its useEffect.
    await page.waitForFunction(
      () =>
        document.title.length > 0 &&
        !!document.querySelector('meta[name="description"]'),
      { timeout: 15000 },
    );
    await new Promise((r) => setTimeout(r, 800));

    let html = await page.content();

    // Strip any data-seo="route" duplicate guard markers we use at runtime;
    // crawlers don't need them (they'll be re-added on hydration).
    html = html.replaceAll(' data-seo="route"', '');

    // Inject a small attribution comment so we can detect prerendered pages.
    html = html.replace(
      '<!doctype html>',
      `<!doctype html><!-- prerendered by HelplyAI build-time prerenderer at ${new Date().toISOString()} -->`,
    );

    return html;
  } finally {
    await page.close();
  }
}

async function main() {
  console.log(`[prerender] starting preview on :${PREVIEW_PORT}`);
  const preview = await startPreview();
  try {
    await waitForServer(`http://127.0.0.1:${PREVIEW_PORT}/`);
    console.log('[prerender] preview ready');

    const browser = await puppeteer.launch({
      headless: 'new',
      ...(CHROME_PATH ? { executablePath: CHROME_PATH } : {}),
      args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
    });
    try {
      let ok = 0;
      let fail = 0;
      for (const route of ROUTES) {
        try {
          const html = await renderRoute(browser, route);
          const target =
            route === '/'
              ? path.join(DIST_DIR, 'index.html')
              : path.join(DIST_DIR, route.replace(/^\//, ''), 'index.html');
          await mkdir(path.dirname(target), { recursive: true });
          await writeFile(target, html, 'utf8');
          console.log(
            `[prerender] ✓ ${route.padEnd(46)} → ${path.relative(process.cwd(), target)}`,
          );
          ok++;
        } catch (err) {
          fail++;
          console.warn(`[prerender] ✗ ${route} :: ${err?.message ?? err}`);
        }
      }
      console.log(`[prerender] done. ok=${ok} fail=${fail}`);
      if (fail > 0 && process.env.PRERENDER_STRICT === '1') process.exit(1);
    } finally {
      await browser.close();
    }
  } finally {
    preview.kill('SIGTERM');
  }
}

main().catch((err) => {
  console.error('[prerender] fatal:', err);
  process.exit(1);
});
