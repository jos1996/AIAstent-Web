#!/usr/bin/env node
/**
 * End-to-end production smoke test.
 *
 * Hits every route declared in `src/AppRoutes.tsx` plus assets, redirects,
 * and edge cases against a live origin (default: https://www.helplyai.co)
 * and asserts:
 *   - status code is in the expected set
 *   - response body actually contains the SPA shell (has #root, react, etc.)
 *
 * Exit non-zero on any failure, so it can be wired into CI / pre-deploy hooks.
 *
 * Usage:
 *   node scripts/smoke-test.mjs                          # hits prod
 *   ORIGIN=https://staging.helplyai.co node scripts/smoke-test.mjs
 *   VERBOSE=1 node scripts/smoke-test.mjs
 */
const ORIGIN = process.env.ORIGIN || 'https://www.helplyai.co';
const VERBOSE = process.env.VERBOSE === '1';
const CONCURRENCY = Number(process.env.CONCURRENCY || 8);

const SPA_ROUTES = [
  '/',
  '/about',
  '/privacy',
  '/refund',
  // settings (auth-gated, but SPA shell must serve so client-side router can render or redirect)
  '/settings',
  '/settings/dashboard',
  '/settings/profile',
  '/settings/updates',
  '/settings/tutorials',
  '/settings/history',
  '/settings/reminders',
  '/settings/language',
  '/settings/billing',
  '/settings/help',
  '/settings/job-search',
  '/settings/referral',
  '/auth/callback',
  // prerendered SEO
  '/ai-interview-helper',
  '/online-interview-helper',
  '/ai-resume-builder',
  '/mock-interview-ai',
  '/ai-job-search',
  '/free-ai-interview-helper',
  '/google-meet-ai-interview-helper',
  '/microsoft-teams-ai-interview-helper',
  '/ai-interview-answer-generator',
  '/google-interview-ai-helper',
  '/amazon-interview-ai-helper',
  '/meta-interview-ai-helper',
  '/microsoft-interview-ai-helper',
  '/mckinsey-case-interview-ai',
  '/goldman-sachs-interview-ai',
  '/faang-interview-ai-helper',
  '/coding-interview-ai-helper',
  '/system-design-interview-ai',
  '/behavioral-interview-ai-helper',
  // competitor comparison (SPA, not prerendered)
  '/vs/final-round-ai',
  '/vs/lockedin-ai',
  '/vs/hirin-ai',
  '/vs/parakeet-ai',
  '/vs/uncharted-career',
  // blog
  '/blog/how-to-crack-interview',
  '/blog/real-time-ai-interview-helper',
  '/blog/zoom-ai-interview-helper',
  '/blog/online-interview-helper',
  '/blog/ai-interview-tips',
  '/blog/star-method-guide',
  '/blog/best-ai-interview-helper-tools',
  // alternatives
  '/alternatives',
  '/alternatives/final-round-ai-alternative',
  '/alternatives/lockedin-ai-alternative',
  '/alternatives/sensei-ai-alternative',
  '/alternatives/parakeet-ai-alternative',
  '/alternatives/beyz-ai-alternative',
  '/alternatives/interviews-chat-alternative',
  '/alternatives/aiapply-alternative',
  '/alternatives/live-interview-ai-alternative',
  // compare
  '/compare/final-round-ai-vs-helplyai',
  '/compare/lockedin-ai-vs-helplyai',
  '/compare/sensei-ai-vs-helplyai',
  '/compare/parakeet-ai-vs-helplyai',
  // interview-prep
  '/interview-prep/software-engineer',
  '/interview-prep/product-manager',
  '/interview-prep/finance',
  '/interview-prep/data-science',
  '/interview-prep/marketing',
  '/interview-prep/consulting',
];

const STATIC_ASSETS = [
  { path: '/sitemap.xml', expectStatus: 200, contains: '<urlset' },
  { path: '/robots.txt', expectStatus: 200, contains: 'User-agent' },
  { path: '/llms.txt', expectStatus: 200, contains: 'HelplyAI' },
  { path: '/favicon.ico', expectStatus: 200 },
  { path: '/favicon.png', expectStatus: 200 },
  { path: '/favicon-32.png', expectStatus: 200 },
  { path: '/favicon-16.png', expectStatus: 200 },
];

const API_PROBES = [
  // function should be reached, not rewritten into the SPA shell.
  // POST is required; GET returns 405 from the handler itself.
  { path: '/api/tailor-resume', expectStatus: [405, 200] },
];

const REDIRECT_PROBES = [
  // cleanUrls: false routes should not 404 trailing slash; they should 308/301 to canonical
  { path: '/ai-resume-builder/', expectStatus: [200, 308, 301] },
  { path: '/index.html', expectStatus: [200, 308, 301] },
  // apex → www
  { path: 'https://helplyai.co/', expectStatus: [200, 307, 308, 301], absolute: true },
];

const UNKNOWN_ROUTES = [
  // Should NOT 404 — should serve SPA shell so client router can decide.
  '/totally-made-up-route',
  '/foo/bar/baz',
];

const SPA_BODY_MARKERS = ['<div id="root"', '/assets/index-', 'helplyai', 'HelplyAI'];

async function fetchUrl(url, opts = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 20_000);
  try {
    const res = await fetch(url, {
      redirect: opts.redirect ?? 'manual',
      headers: {
        'user-agent': 'helplyai-smoke-test/1.0',
        accept: '*/*',
      },
      signal: ctrl.signal,
    });
    const text = await res.text();
    return { ok: true, status: res.status, headers: res.headers, body: text };
  } catch (err) {
    return { ok: false, error: err };
  } finally {
    clearTimeout(t);
  }
}

async function pool(items, fn, concurrency) {
  const queue = [...items];
  const results = new Array(items.length);
  let idx = 0;
  async function worker() {
    while (queue.length > 0) {
      const i = idx++;
      const item = queue.shift();
      if (item === undefined) return;
      results[i] = await fn(item, i);
    }
  }
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, worker);
  await Promise.all(workers);
  return results;
}

function bodyLooksLikeSpaShell(body) {
  return SPA_BODY_MARKERS.some((m) => body.includes(m));
}

function fmt(status, path, note) {
  const pad = (s, n) => (s + ' '.repeat(n)).slice(0, n);
  return `${pad(String(status), 5)} ${pad(path, 56)} ${note || ''}`.trimEnd();
}

const failures = [];

async function runSpaRoutes() {
  console.log(`\n=== SPA routes (${SPA_ROUTES.length}) — expect 200 + SPA shell ===`);
  await pool(
    SPA_ROUTES,
    async (path) => {
      const r = await fetchUrl(ORIGIN + path);
      if (!r.ok) {
        failures.push({ path, reason: `fetch failed: ${r.error?.message}` });
        console.log(fmt('ERR', path, r.error?.message));
        return;
      }
      const okStatus = r.status === 200;
      const okBody = bodyLooksLikeSpaShell(r.body);
      if (!okStatus || !okBody) {
        failures.push({
          path,
          reason: !okStatus
            ? `status=${r.status} expected 200`
            : 'body does not look like SPA shell',
        });
        console.log(fmt(r.status, path, !okStatus ? 'FAIL status' : 'FAIL body'));
      } else if (VERBOSE) {
        console.log(fmt(r.status, path, 'OK'));
      }
    },
    CONCURRENCY,
  );
  if (!VERBOSE) console.log(`  ${SPA_ROUTES.length - failures.filter((f) => SPA_ROUTES.includes(f.path)).length}/${SPA_ROUTES.length} OK`);
}

async function runAssets() {
  console.log(`\n=== Static assets (${STATIC_ASSETS.length}) ===`);
  for (const a of STATIC_ASSETS) {
    const r = await fetchUrl(ORIGIN + a.path);
    if (!r.ok) {
      failures.push({ path: a.path, reason: `fetch failed: ${r.error?.message}` });
      console.log(fmt('ERR', a.path, r.error?.message));
      continue;
    }
    const okStatus = r.status === a.expectStatus;
    const okBody = !a.contains || r.body.includes(a.contains);
    if (!okStatus || !okBody) {
      failures.push({
        path: a.path,
        reason: !okStatus
          ? `status=${r.status} expected ${a.expectStatus}`
          : `body missing "${a.contains}"`,
      });
      console.log(fmt(r.status, a.path, !okStatus ? `FAIL want ${a.expectStatus}` : `FAIL missing "${a.contains}"`));
    } else {
      console.log(fmt(r.status, a.path, 'OK'));
    }
  }
}

async function runApi() {
  console.log(`\n=== API endpoints (${API_PROBES.length}) — must NOT be SPA-rewritten ===`);
  for (const a of API_PROBES) {
    const r = await fetchUrl(ORIGIN + a.path);
    if (!r.ok) {
      failures.push({ path: a.path, reason: `fetch failed: ${r.error?.message}` });
      console.log(fmt('ERR', a.path, r.error?.message));
      continue;
    }
    const expected = Array.isArray(a.expectStatus) ? a.expectStatus : [a.expectStatus];
    const okStatus = expected.includes(r.status);
    const notSpa = !bodyLooksLikeSpaShell(r.body);
    if (!okStatus || !notSpa) {
      failures.push({
        path: a.path,
        reason: !okStatus
          ? `status=${r.status} expected ${expected.join('/')}`
          : 'API path was rewritten to SPA shell (CRITICAL)',
      });
      console.log(fmt(r.status, a.path, !okStatus ? `FAIL want ${expected.join('/')}` : 'FAIL got SPA shell'));
    } else {
      console.log(fmt(r.status, a.path, 'OK'));
    }
  }
}

async function runRedirects() {
  console.log(`\n=== Redirects / canonical (${REDIRECT_PROBES.length}) ===`);
  for (const p of REDIRECT_PROBES) {
    const url = p.absolute ? p.path : ORIGIN + p.path;
    const r = await fetchUrl(url);
    if (!r.ok) {
      failures.push({ path: p.path, reason: `fetch failed: ${r.error?.message}` });
      console.log(fmt('ERR', p.path, r.error?.message));
      continue;
    }
    const expected = Array.isArray(p.expectStatus) ? p.expectStatus : [p.expectStatus];
    const okStatus = expected.includes(r.status);
    if (!okStatus) {
      failures.push({ path: p.path, reason: `status=${r.status} expected ${expected.join('/')}` });
      console.log(fmt(r.status, p.path, `FAIL want ${expected.join('/')}`));
    } else {
      console.log(fmt(r.status, p.path, r.headers.get('location') || 'OK'));
    }
  }
}

async function runUnknown() {
  console.log(`\n=== Unknown paths — SPA must catch them (200 + shell) ===`);
  for (const path of UNKNOWN_ROUTES) {
    const r = await fetchUrl(ORIGIN + path);
    if (!r.ok) {
      failures.push({ path, reason: `fetch failed: ${r.error?.message}` });
      console.log(fmt('ERR', path, r.error?.message));
      continue;
    }
    const okStatus = r.status === 200;
    const okBody = bodyLooksLikeSpaShell(r.body);
    if (!okStatus || !okBody) {
      failures.push({
        path,
        reason: !okStatus ? `status=${r.status} expected 200` : 'body does not look like SPA shell',
      });
      console.log(fmt(r.status, path, !okStatus ? 'FAIL status' : 'FAIL body'));
    } else {
      console.log(fmt(r.status, path, 'OK'));
    }
  }
}

(async () => {
  const start = Date.now();
  console.log(`smoke-test :: origin=${ORIGIN} concurrency=${CONCURRENCY}`);
  await runSpaRoutes();
  await runAssets();
  await runApi();
  await runRedirects();
  await runUnknown();
  const ms = Date.now() - start;
  console.log(`\nDone in ${(ms / 1000).toFixed(1)}s`);
  if (failures.length > 0) {
    console.log(`\n✗ ${failures.length} failure(s):`);
    for (const f of failures) console.log(`  - ${f.path} :: ${f.reason}`);
    process.exit(1);
  }
  console.log(`✓ All checks passed.`);
})();
