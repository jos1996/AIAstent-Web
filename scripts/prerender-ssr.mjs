#!/usr/bin/env node
/**
 * Build-time SSR prerender — Chromium-free, Vercel-friendly.
 *
 * Flow
 * ----
 *   1. Vite has already built the client bundle into `dist/`
 *      (incl. `dist/index.html` shell).
 *   2. We separately build the SSR bundle into `dist-ssr/` from
 *      `src/entry-server.tsx`.
 *   3. We import the SSR bundle's `render(url)` function and call it once
 *      per route in `ROUTE_META`.
 *   4. For each route we compose the final HTML by:
 *        a. taking the client `dist/index.html` shell (so all <script>,
 *           <link rel="stylesheet">, GA tag, baseline schema is preserved),
 *        b. rewriting <title>, <meta description>, <link rel=canonical>,
 *           OpenGraph, Twitter Card to the route's metadata,
 *        c. injecting BreadcrumbList + FAQ + SoftwareApplication JSON-LD,
 *        d. inserting the SSR-rendered body into `<div id="root"></div>`,
 *      and writing it to `dist/<route>/index.html`.
 *
 * Result: Googlebot's first pass sees the fully-rendered HTML body AND the
 * route-correct head metadata for every SEO page — without ever launching
 * a browser.
 */
import { spawnSync } from 'node:child_process';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const DIST = path.resolve(ROOT, 'dist');
const SSR_DIST = path.resolve(ROOT, 'dist-ssr');
const SHELL_HTML = path.join(DIST, 'index.html');

const ESC = (s) =>
  String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

function jsonLd(obj) {
  // No HTML escape inside script tags — JSON.stringify already handles it.
  // Just guard against `</script>` injection via a simple replace.
  return JSON.stringify(obj).replaceAll('</', '<\\/');
}

function buildSchemas(meta) {
  const blocks = [];
  if (meta.breadcrumbs && meta.breadcrumbs.length > 0) {
    blocks.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: meta.breadcrumbs.map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: c.name,
        item: c.url,
      })),
    });
  }
  if (meta.faqs && meta.faqs.length > 0) {
    blocks.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: meta.faqs.map(({ q, a }) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a },
      })),
    });
  }
  blocks.push({
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'HelplyAI',
    description: meta.description,
    url: `https://www.helplyai.co${meta.path === '/' ? '' : meta.path}`,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'macOS, Windows',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    author: { '@type': 'Organization', name: 'HelplyAI' },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '32178',
      bestRating: '5',
    },
  });
  return blocks
    .map((b) => `<script type="application/ld+json" data-prerender-ssr="1">${jsonLd(b)}</script>`)
    .join('\n  ');
}

function rewriteHead(shell, meta) {
  const canonical =
    meta.path === '/' ? 'https://www.helplyai.co/' : `https://www.helplyai.co${meta.path}`;
  let h = shell;

  h = h.replace(/<title>[\s\S]*?<\/title>/, `<title>${ESC(meta.title)}</title>`);
  h = h.replace(
    /<meta\s+name="title"\s+content="[^"]*"\s*\/?>/,
    `<meta name="title" content="${ESC(meta.title)}" />`,
  );
  h = h.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${ESC(meta.description)}" />`,
  );
  if (meta.keywords) {
    h = h.replace(
      /<meta\s+name="keywords"\s+content="[^"]*"\s*\/?>/,
      `<meta name="keywords" content="${ESC(meta.keywords)}" />`,
    );
  }
  h = h.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
    `<link rel="canonical" href="${canonical}" />`,
  );
  h = h.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:url" content="${canonical}" />`,
  );
  h = h.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:title" content="${ESC(meta.title)}" />`,
  );
  h = h.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:description" content="${ESC(meta.description)}" />`,
  );
  h = h.replace(
    /<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:type" content="${meta.ogType ?? 'website'}" />`,
  );
  h = h.replace(
    /<meta\s+property="twitter:url"\s+content="[^"]*"\s*\/?>/,
    `<meta property="twitter:url" content="${canonical}" />`,
  );
  h = h.replace(
    /<meta\s+property="twitter:title"\s+content="[^"]*"\s*\/?>/,
    `<meta property="twitter:title" content="${ESC(meta.title)}" />`,
  );
  h = h.replace(
    /<meta\s+property="twitter:description"\s+content="[^"]*"\s*\/?>/,
    `<meta property="twitter:description" content="${ESC(meta.description)}" />`,
  );

  if (meta.noindex) {
    h = h.replace(
      /<meta\s+name="robots"\s+content="[^"]*"\s*\/?>/,
      `<meta name="robots" content="noindex, nofollow" />`,
    );
  }

  // Inject route-specific JSON-LD before </head>.
  const schemas = buildSchemas(meta);
  if (schemas) {
    h = h.replace('</head>', `  ${schemas}\n  </head>`);
  }

  // Drop a small attribution comment so we can detect SSR-prerendered routes
  // when crawling production with JS disabled.
  h = h.replace(
    '<!doctype html>',
    `<!doctype html><!-- ssr-prerendered by HelplyAI at ${new Date().toISOString()} -->`,
  );
  return h;
}

function injectBody(html, ssrHtml) {
  return html.replace('<div id="root"></div>', `<div id="root">${ssrHtml}</div>`);
}

function buildSsrBundle() {
  console.log('[ssr-prerender] building SSR bundle…');
  const r = spawnSync(
    process.execPath,
    [
      path.resolve(ROOT, 'node_modules/vite/bin/vite.js'),
      'build',
      '--ssr',
      'src/entry-server.tsx',
      '--outDir',
      'dist-ssr',
    ],
    { stdio: 'inherit', cwd: ROOT },
  );
  if (r.status !== 0) {
    throw new Error(`vite ssr build failed (status=${r.status})`);
  }
}

async function loadSsrModule() {
  const entry = path.join(SSR_DIST, 'entry-server.js');
  const url = pathToFileURL(entry).href;
  return await import(url);
}

async function loadRouteMeta() {
  // Build a tiny ESM-importable copy of the route metadata so the script
  // doesn't need to compile TS itself. We dynamically import the SSR bundle
  // (which already has routeMetadata bundled) — but the cleanest route is to
  // ship a tiny .mjs metadata mirror. Easier: just import from the SSR bundle.
  // The SSR bundle re-exports nothing, so we need a separate metadata bundle.
  console.log('[ssr-prerender] building metadata bundle…');
  const r = spawnSync(
    process.execPath,
    [
      path.resolve(ROOT, 'node_modules/vite/bin/vite.js'),
      'build',
      '--ssr',
      'src/lib/routeMetadata.ts',
      '--outDir',
      'dist-ssr/meta',
    ],
    { stdio: 'inherit', cwd: ROOT },
  );
  if (r.status !== 0) {
    throw new Error(`vite ssr metadata build failed (status=${r.status})`);
  }
  const url = pathToFileURL(path.join(SSR_DIST, 'meta', 'routeMetadata.js')).href;
  const m = await import(url);
  return m.ROUTE_META;
}

async function main() {
  const shell = await readFile(SHELL_HTML, 'utf8');

  buildSsrBundle();
  const ssr = await loadSsrModule();
  if (typeof ssr.render !== 'function') {
    throw new Error('SSR bundle missing exported render(url) function');
  }
  const ROUTE_META = await loadRouteMeta();
  if (!Array.isArray(ROUTE_META)) {
    throw new Error('ROUTE_META did not load as an array');
  }

  console.log(`[ssr-prerender] rendering ${ROUTE_META.length} routes…`);
  let ok = 0;
  let fail = 0;
  for (const meta of ROUTE_META) {
    try {
      const ssrHtml = ssr.render(meta.path);
      let html = rewriteHead(shell, meta);
      html = injectBody(html, ssrHtml);

      const target =
        meta.path === '/'
          ? path.join(DIST, 'index.html')
          : path.join(DIST, meta.path.replace(/^\//, ''), 'index.html');
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, html, 'utf8');
      console.log(`[ssr-prerender] ✓ ${meta.path.padEnd(46)} (${(html.length / 1024).toFixed(1)} KB)`);
      ok++;
    } catch (err) {
      fail++;
      console.warn(`[ssr-prerender] ✗ ${meta.path} :: ${err?.stack ?? err}`);
    }
  }
  console.log(`[ssr-prerender] done. ok=${ok} fail=${fail}`);
  if (fail > 0 && process.env.PRERENDER_STRICT === '1') process.exit(1);
}

main().catch((err) => {
  console.error('[ssr-prerender] fatal:', err);
  process.exit(1);
});
