#!/usr/bin/env node
/**
 * Lightweight, dependency-free fallback prerender.
 *
 * Why this exists in addition to `scripts/prerender.mjs`
 * ------------------------------------------------------
 * `prerender.mjs` uses headless Chromium (via Puppeteer) to render the full
 * React app for each route. That gives the absolute best SEO surface, but
 * also depends on Chromium being launchable on the build host. On hosts
 * where that's flaky (e.g. some Vercel build images), this script provides a
 * deterministic fallback: it stamps per-route `<title>`, meta description,
 * canonical link, OpenGraph, Twitter Card, and JSON-LD into a copy of the
 * built `dist/index.html` and writes one to each `dist/<route>/index.html`.
 *
 * Googlebot will still need to JS-render the body, but the head metadata
 * (which is the strongest signal for SERPs) is correct on first byte.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const DIST = path.resolve('dist');
const SOURCE = path.join(DIST, 'index.html');

const ROUTES = [
  {
    path: '/ai-interview-helper',
    title: 'AI Interview Helper – Crack Any Job Interview with Real-Time AI | HelplyAI',
    description:
      'HelplyAI is the #1 AI interview helper. Get real-time AI assistance during live interviews, practice mock interviews, and crack technical, HR, and behavioral interviews. Best alternative to Final Round AI & LockedIn AI.',
    keywords:
      'AI interview helper, real-time interview assistant, AI mock interview, best AI interview tool 2026, FAANG interview prep, Final Round AI alternative',
  },
  {
    path: '/online-interview-helper',
    title: 'Online Interview Helper — Real-Time AI for Remote Interviews 2026 | HelplyAI',
    description:
      'HelplyAI is the #1 online interview helper of 2026. Real-time AI answers, transcription, and stealth coaching for Zoom, Google Meet, Microsoft Teams, and 10+ remote interview platforms. Free plan · Mac & Windows.',
    keywords:
      'online interview helper, real time interview helper, online interview ai, remote interview helper, virtual interview helper, online interview assistant',
  },
  {
    path: '/mock-interview-ai',
    title: 'Mock Interview AI — Free AI Mock Interviewer for 2026 | HelplyAI',
    description:
      'Practice unlimited AI mock interviews with HelplyAI. Realistic technical, behavioral, and HR rounds with instant feedback, scoring, and STAR-method coaching. Free to start.',
    keywords:
      'mock interview ai, ai mock interview, free mock interview, mock interviewer ai, online mock interview, mock interview practice, behavioral mock interview',
  },
  {
    path: '/ai-resume-builder',
    title: 'AI Resume Builder — Free Resume Maker That Beats ATS in 2026 | HelplyAI',
    description:
      'HelplyAI is the #1 free AI resume builder of 2026. Upload a job description, generate an ATS-optimized resume in 30 seconds, pick from executive / modern / clean templates, and download as PDF.',
    keywords:
      'ai resume builder, free resume builder, resume maker, ats resume builder, ai resume generator, free resume maker, online resume builder',
  },
  {
    path: '/ai-job-search',
    title: 'AI Job Search — Find Roles, Tailor Resumes, Auto-Apply | HelplyAI',
    description:
      'HelplyAI is the smartest AI job search tool of 2026. Search 1M+ jobs, instant resume tailoring, AI cover letters, salary signals, and one-click apply on Indeed, LinkedIn, and Greenhouse. Free to start.',
    keywords:
      'ai job search, ai job board, job search ai, ai job matching, ai job apply, auto apply jobs, ai cover letter, ai resume tailoring',
  },
  {
    path: '/free-ai-interview-helper',
    title: 'Free AI Interview Helper — Real-Time AI Answers, No Credit Card | HelplyAI',
    description:
      'HelplyAI is the only truly free AI interview helper of 2026. Real-time AI answers during Zoom, Google Meet, and Teams interviews. Free plan with stealth mode, mock interviews, and resume builder — no credit card required.',
    keywords:
      'free ai interview helper, free interview copilot, free real time interview helper, free ai interview assistant, free ai mock interview',
  },
  {
    path: '/google-meet-ai-interview-helper',
    title: 'Google Meet AI Interview Helper — Real-Time AI Answers in Meet | HelplyAI',
    description:
      'HelplyAI is the #1 Google Meet AI interview helper of 2026. Real-time AI answers, transcription, and stealth-mode coaching during Google Meet interviews. Free plan · Mac & Windows.',
    keywords:
      'google meet ai interview helper, google meet interview helper, ai for google meet, google meet copilot, real time interview google meet',
  },
  {
    path: '/microsoft-teams-ai-interview-helper',
    title: 'Microsoft Teams AI Interview Helper — Real-Time AI Answers in Teams | HelplyAI',
    description:
      'HelplyAI is the #1 Microsoft Teams AI interview helper of 2026. Real-time AI answers and stealth coaching during Teams interviews. Works on Microsoft Teams Free, Business, and Enterprise.',
    keywords:
      'microsoft teams ai interview helper, ms teams ai interview helper, teams ai interview, ms teams copilot interview, ai for ms teams',
  },
  {
    path: '/ai-interview-answer-generator',
    title: 'AI Interview Answer Generator — Instant STAR-Style Answers | HelplyAI',
    description:
      'HelplyAI is the most accurate AI interview answer generator of 2026. Paste any interview question and get a structured, STAR-method, recruiter-grade answer in seconds. Free, supports all interview types.',
    keywords:
      'ai interview answer generator, interview answer generator, behavioral interview answer ai, free interview answer ai, star method generator',
  },
];

const ESC = (s) =>
  s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

async function main() {
  const baseHtml = await readFile(SOURCE, 'utf8');
  let ok = 0;
  let fail = 0;
  for (const r of ROUTES) {
    try {
      const canonical = `https://www.helplyai.co${r.path}`;
      let html = baseHtml;

      // <title> — replace exact tag.
      html = html.replace(/<title>[^<]*<\/title>/, `<title>${ESC(r.title)}</title>`);

      // meta name="title"
      html = html.replace(
        /<meta\s+name="title"\s+content="[^"]*"\s*\/?>/,
        `<meta name="title" content="${ESC(r.title)}" />`,
      );

      // meta name="description"
      html = html.replace(
        /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
        `<meta name="description" content="${ESC(r.description)}" />`,
      );

      // meta name="keywords"
      html = html.replace(
        /<meta\s+name="keywords"\s+content="[^"]*"\s*\/?>/,
        `<meta name="keywords" content="${ESC(r.keywords)}" />`,
      );

      // canonical link
      html = html.replace(
        /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
        `<link rel="canonical" href="${canonical}" />`,
      );

      // OpenGraph
      html = html.replace(
        /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/,
        `<meta property="og:url" content="${canonical}" />`,
      );
      html = html.replace(
        /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
        `<meta property="og:title" content="${ESC(r.title)}" />`,
      );
      html = html.replace(
        /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
        `<meta property="og:description" content="${ESC(r.description)}" />`,
      );

      // Twitter card
      html = html.replace(
        /<meta\s+property="twitter:url"\s+content="[^"]*"\s*\/?>/,
        `<meta property="twitter:url" content="${canonical}" />`,
      );
      html = html.replace(
        /<meta\s+property="twitter:title"\s+content="[^"]*"\s*\/?>/,
        `<meta property="twitter:title" content="${ESC(r.title)}" />`,
      );
      html = html.replace(
        /<meta\s+property="twitter:description"\s+content="[^"]*"\s*\/?>/,
        `<meta property="twitter:description" content="${ESC(r.description)}" />`,
      );

      // BreadcrumbList JSON-LD injected before </head>.
      const breadcrumb = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.helplyai.co' },
          { '@type': 'ListItem', position: 2, name: r.title.split('—')[0].trim(), item: canonical },
        ],
      };
      const breadcrumbScript = `<script type="application/ld+json" data-meta-prerender="breadcrumb">${JSON.stringify(breadcrumb)}</script>`;

      html = html.replace('</head>', `  ${breadcrumbScript}\n  </head>`);

      // Tag the file so we can detect this prerender pass on prod.
      html = html.replace(
        '<!doctype html>',
        `<!doctype html><!-- prerendered (meta) by HelplyAI at ${new Date().toISOString()} -->`,
      );

      const target = path.join(DIST, r.path.replace(/^\//, ''), 'index.html');
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, html, 'utf8');
      console.log(`[meta-prerender] ✓ ${r.path}`);
      ok++;
    } catch (err) {
      fail++;
      console.warn(`[meta-prerender] ✗ ${r.path} :: ${err?.message ?? err}`);
    }
  }
  console.log(`[meta-prerender] done. ok=${ok} fail=${fail}`);
  if (fail > 0 && process.env.PRERENDER_STRICT === '1') process.exit(1);
}

main().catch((err) => {
  console.error('[meta-prerender] fatal:', err);
  process.exit(1);
});
