#!/usr/bin/env node
/**
 * IndexNow submission — instant URL indexation.
 *
 * IndexNow is a protocol jointly built by Microsoft Bing, Yandex, Naver,
 * Seznam, and Yep. Submitting a URL via IndexNow gets it crawled and indexed
 * within minutes-to-hours instead of weeks. Brave Search and DuckDuckGo
 * partially rely on Bing's index, so an IndexNow submission to Bing also
 * propagates to those engines.
 *
 * Flow
 * ----
 *   1. Read the canonical URL list from `public/sitemap.xml`.
 *   2. POST the list to `api.indexnow.org` in one batch (max 10k URLs).
 *   3. The verification key (`public/<KEY>.txt`) is served as a static file
 *      under the same host, which is how IndexNow proves the submitter owns
 *      the domain.
 *
 * Run manually:    `npm run indexnow`
 * Run on deploy:   wired into Vercel's `build` step.
 *
 * Google does NOT participate in IndexNow yet — they kept the (now-removed)
 * sitemap-ping endpoint and the Indexing API (which is restricted to job
 * postings + broadcast events). For Google, the only reliable path is
 * submitting the sitemap via Search Console; this script prints the
 * one-line URL you need to paste there.
 */

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const KEY = '3eb0359d8ea51eaacc38df6f4cbdcd72';
const HOST = 'www.helplyai.co';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const ENDPOINT = 'https://api.indexnow.org/indexnow';

function parseSitemap(xml) {
  const urls = [];
  const re = /<loc>([^<]+)<\/loc>/g;
  let m;
  while ((m = re.exec(xml))) urls.push(m[1].trim());
  return urls;
}

async function main() {
  const sitemapPath = process.argv[2] ?? path.resolve(process.cwd(), 'public/sitemap.xml');
  const xml = await readFile(sitemapPath, 'utf8');
  const urlList = parseSitemap(xml);
  if (urlList.length === 0) {
    console.error('[indexnow] sitemap has no <loc> entries');
    process.exit(1);
  }

  console.log(`[indexnow] submitting ${urlList.length} URLs to IndexNow (Bing, Yandex, Naver, Seznam, Yep, Brave-via-Bing)…`);

  const body = JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList });
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body,
  });

  const text = await res.text();
  console.log(`[indexnow] status=${res.status}`);
  if (text) console.log(`[indexnow] body=${text.slice(0, 200)}`);

  if (res.status === 200 || res.status === 202) {
    console.log('[indexnow] ✓ submission accepted — Bing/Yandex/Naver/Seznam will crawl shortly.');
    console.log('');
    console.log('Manual next steps (do these once, ~5 min total):');
    console.log('  • Google Search Console: add property "www.helplyai.co", submit sitemap');
    console.log('    https://search.google.com/search-console');
    console.log('  • Bing Webmaster Tools: add site, submit sitemap (already pinged via IndexNow above)');
    console.log('    https://www.bing.com/webmasters');
    console.log('  • Yandex Webmaster: add site, submit sitemap');
    console.log('    https://webmaster.yandex.com/');
    console.log('  • Sitemap URL to paste anywhere asked: https://www.helplyai.co/sitemap.xml');
  } else if (res.status === 422) {
    console.error('[indexnow] ✗ 422 — usually means the key file is not yet live on the host.');
    console.error(`             Confirm: curl ${KEY_LOCATION}`);
    process.exit(1);
  } else {
    console.error(`[indexnow] ✗ unexpected status ${res.status}`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error('[indexnow] fatal:', e);
  process.exit(1);
});
