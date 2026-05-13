#!/usr/bin/env node
/**
 * Build-time sanity check for `vercel.json`.
 *
 * The site has burned us twice with subtle rewrite bugs that only show up
 * in production (the regex got silently dropped, or `destination`
 * collided with `cleanUrls`). This script asserts the invariants that, if
 * violated, would 404 every non-prerendered route — *before* Vercel ever
 * sees the commit. Run from `npm run build` (predeploy gate).
 *
 * Invariants enforced:
 *   1. A SPA-fallback rewrite exists.
 *   2. Its `source` is anchored at "/" and matches at least one nested path
 *      (i.e. the negative-lookahead actually still parses).
 *   3. Its `destination` is NOT "/index.html" — that path collides with
 *      `cleanUrls: true` which auto-308s `/index.html` -> `/` and breaks
 *      internal rewrites. Must be "/".
 *   4. The `/api/*` namespace is excluded from the SPA fallback so the
 *      Vercel Functions in `api/` still get hit.
 *   5. No `redirects` rule clobbers the SPA fallback.
 *
 * Exit 1 on any violation. Non-zero exit fails `npm run build`.
 */
import { readFileSync } from 'node:fs';
import { pathToRegexp } from 'path-to-regexp';
import path from 'node:path';

const ROOT = process.cwd();
const VERCEL_JSON = path.join(ROOT, 'vercel.json');

const FAIL = (msg) => {
  console.error(`\x1b[31m✗ vercel.json check failed:\x1b[0m ${msg}`);
  process.exit(1);
};
const OK = (msg) => console.log(`\x1b[32m✓\x1b[0m ${msg}`);

let cfg;
try {
  cfg = JSON.parse(readFileSync(VERCEL_JSON, 'utf8'));
} catch (err) {
  FAIL(`could not read or parse vercel.json: ${err?.message ?? err}`);
}

if (!Array.isArray(cfg.rewrites) || cfg.rewrites.length === 0) {
  FAIL('no `rewrites` array — SPA fallback missing');
}

const spaFallback = cfg.rewrites.find(
  (r) => r && typeof r.source === 'string' && r.source.startsWith('/(') && r.destination,
);
if (!spaFallback) {
  FAIL('could not find a SPA-fallback rewrite (expected one with source like "/((?!api).*)")');
}
OK(`found SPA fallback: ${JSON.stringify(spaFallback)}`);

// Invariant 3: destination must be "/", not "/index.html".
// With `cleanUrls: true`, Vercel auto-308s "/index.html" -> "/" which
// short-circuits the internal rewrite. We learned this the hard way.
if (cfg.cleanUrls && spaFallback.destination === '/index.html') {
  FAIL(
    'cleanUrls=true is set AND SPA fallback rewrites to "/index.html" — this is the historical bug. ' +
      'Change destination to "/".',
  );
}
if (!['/', '/index.html'].includes(spaFallback.destination)) {
  FAIL(
    `SPA fallback destination is "${spaFallback.destination}" — expected "/" (or "/index.html" only when cleanUrls is OFF)`,
  );
}
OK(`destination is safe: "${spaFallback.destination}"`);

// Invariant 2 + 4: the rewrite source must actually match SPA paths but NOT
// /api/* paths. We sanity-test it by compiling the source with the same
// path-to-regexp library Vercel uses, and probing real paths.
let re;
try {
  re = pathToRegexp(spaFallback.source);
} catch (err) {
  FAIL(`SPA fallback source "${spaFallback.source}" did not compile under path-to-regexp: ${err?.message ?? err}`);
}

const mustMatch = [
  '/settings/dashboard',
  '/about',
  '/settings/billing',
  '/auth/callback',
  '/vs/lockedin-ai',
  '/totally-unknown-path',
  '/foo/bar/baz',
];
const mustNotMatch = ['/api/tailor-resume', '/api/foo/bar', '/api'];

for (const p of mustMatch) {
  if (!re.test(p)) {
    FAIL(`SPA fallback "${spaFallback.source}" does NOT match "${p}" — would 404 in prod`);
  }
}
OK(`SPA fallback matches all ${mustMatch.length} required client-routed paths`);

for (const p of mustNotMatch) {
  if (re.test(p)) {
    FAIL(`SPA fallback "${spaFallback.source}" wrongly matches "${p}" — would clobber the API function`);
  }
}
OK(`SPA fallback correctly excludes /api/* (${mustNotMatch.length} paths verified)`);

// Invariant 5: no redirect rule that would catch SPA paths.
if (Array.isArray(cfg.redirects)) {
  for (const rd of cfg.redirects) {
    if (typeof rd?.source !== 'string') continue;
    let rre;
    try { rre = pathToRegexp(rd.source); } catch { continue; }
    const collide = mustMatch.find((p) => rre.test(p));
    if (collide) {
      FAIL(`redirect rule "${rd.source}" -> "${rd.destination}" would catch "${collide}" before the SPA fallback`);
    }
  }
  OK('no redirect rules clobber the SPA fallback');
}

console.log('\n\x1b[32mvercel.json :: all routing invariants hold ✓\x1b[0m\n');
