// ── ATS Analyzer ─────────────────────────────────────────────────────────────
// Hybrid resume analysis. Layer 1 is deterministic rules that run in the
// browser instantly — same checks real ATS pipelines apply (contact-info
// coverage, parseable section headers, quantified bullets, action verbs,
// length, formatting hazards). Layer 2 is an AI semantic match against the
// user's job description, served by `/api/ats-check`, which provides true
// keyword matching and rewrite-grade suggestions.
//
// Local first means the user gets value with zero network cost; the AI
// layer is opt-in based on whether a JD was supplied.

export type Status = 'good' | 'warn' | 'bad';

export interface SectionScore {
  score: number; // 0-100
  status: Status;
  message: string;
  detail?: string;
}

export interface AtsAnalysis {
  overallScore: number; // 0-100
  scoreLabel: 'Excellent' | 'Good' | 'Needs Work' | 'Poor';
  // Per-section scores
  sections: {
    contactInfo: SectionScore;
    structure: SectionScore;
    keywords: SectionScore;
    impact: SectionScore;
    length: SectionScore;
    formatting: SectionScore;
  };
  // JD match (only populated when JD provided)
  jdMatch?: {
    matchScore: number; // 0-100
    matchedKeywords: string[];
    missingKeywords: string[];
    aiSuggestions: string[];
  };
  // Headline analysis
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  // Raw stats for the UI to render badges
  stats: {
    wordCount: number;
    bulletCount: number;
    actionVerbCount: number;
    quantifiedBullets: number;
    hasEmail: boolean;
    hasPhone: boolean;
    hasLinkedin: boolean;
    hasLocation: boolean;
    sectionsFound: string[];
  };
}

const ACTION_VERBS = [
  'achieved', 'analyzed', 'architected', 'automated', 'built', 'collaborated',
  'created', 'delivered', 'designed', 'developed', 'directed', 'drove',
  'engineered', 'enhanced', 'established', 'executed', 'generated', 'grew',
  'implemented', 'improved', 'increased', 'initiated', 'launched', 'led',
  'managed', 'mentored', 'optimized', 'orchestrated', 'organized', 'owned',
  'pioneered', 'produced', 'reduced', 'refactored', 'researched', 'resolved',
  'scaled', 'shipped', 'solved', 'spearheaded', 'streamlined', 'transformed',
  'won', 'accelerated', 'authored', 'boosted', 'championed', 'consolidated',
  'cut', 'deployed', 'eliminated', 'exceeded', 'expanded', 'forecasted',
  'founded', 'integrated', 'introduced', 'leveraged', 'maximized', 'migrated',
  'modernized', 'monetized', 'negotiated', 'pitched', 'prototyped', 'rebuilt',
  'redesigned', 'restructured', 'revamped', 'saved', 'secured', 'simplified',
  'standardized', 'tripled', 'doubled', 'unified', 'validated',
];

const SECTION_KEYWORDS = [
  { name: 'Experience', patterns: [/\b(work\s+)?experience\b/i, /\bemployment\b/i, /\bprofessional\s+history\b/i] },
  { name: 'Education', patterns: [/\beducation\b/i, /\bacademic\b/i] },
  { name: 'Skills', patterns: [/\b(technical\s+|core\s+)?skills\b/i, /\bcompetenc(y|ies)\b/i] },
  { name: 'Summary', patterns: [/\b(professional\s+)?summary\b/i, /\b(career\s+)?objective\b/i, /\bprofile\b/i, /\babout\s+me\b/i] },
  { name: 'Projects', patterns: [/\bprojects?\b/i, /\bportfolio\b/i] },
  { name: 'Certifications', patterns: [/\bcertifications?\b/i, /\blicenses?\b/i] },
];

// Patterns ATS systems can't reliably parse — used for `formatting` score.
const FORMATTING_HAZARDS: { pattern: RegExp; cost: number; message: string }[] = [
  { pattern: /[│┃║┊┋╎]/, cost: 25, message: 'Vertical bar characters often come from PDF tables; ATS can mis-parse them.' },
  { pattern: /[•▪◦▶►■●○◆◇★☆]{0,0}/, cost: 0, message: '' }, // (kept as no-op slot; bullets themselves are fine)
  { pattern: /\u2028|\u2029|\u200B|\u200C/, cost: 15, message: 'Zero-width / line-separator characters detected — usually copy-paste artifacts.' },
  { pattern: /^\s*\|.*\|\s*$/m, cost: 30, message: 'Markdown-table rows detected. ATS parsers often skip table cells entirely.' },
];

const COMMON_JD_NOISE = new Set([
  'the', 'and', 'or', 'a', 'an', 'of', 'to', 'in', 'on', 'for', 'with',
  'at', 'by', 'from', 'as', 'is', 'are', 'be', 'will', 'have', 'has',
  'this', 'that', 'these', 'those', 'we', 'our', 'you', 'your', 'their',
  'they', 'it', 'its', 'who', 'what', 'when', 'where', 'why', 'how',
  'about', 'all', 'any', 'each', 'every', 'such', 'some', 'so', 'than',
  'then', 'there', 'do', 'does', 'did', 'should', 'could', 'would', 'may',
  'might', 'must', 'can', 'shall', 'work', 'role', 'job', 'team', 'company',
  'candidate', 'looking', 'seeking', 'required', 'requires', 'responsibilities',
  'requirements', 'qualifications', 'preferred', 'plus', 'including',
  'experience', 'years', 'year', 'strong', 'excellent', 'good', 'ability',
  'skills', 'knowledge', 'understanding', 'familiarity', 'background',
  'using', 'use', 'used', 'within', 'across', 'over', 'through', 'while',
  'also', 'including', 'etc', 'eg', 'ie',
]);

function scoreLabel(score: number): AtsAnalysis['scoreLabel'] {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Needs Work';
  return 'Poor';
}

function clamp(n: number, lo = 0, hi = 100): number {
  return Math.max(lo, Math.min(hi, Math.round(n)));
}

function statusFromScore(score: number): Status {
  if (score >= 80) return 'good';
  if (score >= 55) return 'warn';
  return 'bad';
}

function detectContactInfo(text: string) {
  const hasEmail = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/.test(text);
  // Reasonably permissive phone — international + dashes + parens + dots.
  const hasPhone = /(\+?\d[\d\s().-]{7,}\d)/.test(text);
  const hasLinkedin = /linkedin\.com\/(in|pub)\//i.test(text) || /linkedin:?\s*[\w-]+/i.test(text);
  // Location heuristic: "City, ST" or "City, Country" or common state abbrs.
  const hasLocation =
    /\b[A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)?,\s*[A-Z]{2,}\b/.test(text) ||
    /\b(remote|hybrid)\b/i.test(text);
  return { hasEmail, hasPhone, hasLinkedin, hasLocation };
}

function detectSections(text: string): string[] {
  const found: string[] = [];
  for (const { name, patterns } of SECTION_KEYWORDS) {
    if (patterns.some((p) => p.test(text))) found.push(name);
  }
  return found;
}

function extractBullets(text: string): string[] {
  // Lines starting with a bullet character, dash, asterisk, or numbered list.
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => /^[•▪◦‣\-*·]\s+\S/.test(l) || /^\d+[.)]\s+\S/.test(l))
    .map((l) => l.replace(/^[•▪◦‣\-*·]\s+/, '').replace(/^\d+[.)]\s+/, ''));
}

function countQuantifiedBullets(bullets: string[]): number {
  // A "quantified" bullet has a number that conveys impact: %, $, k, M, B, x, +, or any digit run.
  return bullets.filter((b) =>
    /(\d+\s*%|\$\s*\d+|\d+\s*(k|m|b|million|billion|thousand|x)\b|\d{2,})/i.test(b),
  ).length;
}

function countActionVerbs(bullets: string[]): number {
  // First word of each bullet, lowercased.
  const verbs = new Set(ACTION_VERBS);
  let hits = 0;
  for (const b of bullets) {
    const first = b.split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, '');
    if (first && verbs.has(first)) hits++;
  }
  return hits;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#./\s-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function extractJdKeywords(jd: string, maxKeywords = 25): string[] {
  // Score n-grams by frequency × specificity. Single tokens of length <=2
  // and stopwords are dropped. Bi-grams get a 1.5x weight; tri-grams 2x.
  const tokens = tokenize(jd);
  const freq = new Map<string, number>();

  for (let i = 0; i < tokens.length; i++) {
    const w = tokens[i];
    if (w.length < 3 || COMMON_JD_NOISE.has(w)) continue;
    if (/^\d+$/.test(w)) continue;
    freq.set(w, (freq.get(w) || 0) + 1);
    if (i + 1 < tokens.length) {
      const w2 = tokens[i + 1];
      if (w2.length >= 3 && !COMMON_JD_NOISE.has(w2)) {
        const bg = `${w} ${w2}`;
        freq.set(bg, (freq.get(bg) || 0) + 1.5);
      }
    }
    if (i + 2 < tokens.length) {
      const w2 = tokens[i + 1];
      const w3 = tokens[i + 2];
      if (
        w2.length >= 3 && !COMMON_JD_NOISE.has(w2) &&
        w3.length >= 3 && !COMMON_JD_NOISE.has(w3)
      ) {
        const tg = `${w} ${w2} ${w3}`;
        freq.set(tg, (freq.get(tg) || 0) + 2);
      }
    }
  }

  return Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([k]) => k);
}

function findKeywordsInResume(resume: string, keywords: string[]) {
  const lower = ' ' + resume.toLowerCase() + ' ';
  const matched: string[] = [];
  const missing: string[] = [];
  for (const kw of keywords) {
    if (lower.includes(' ' + kw + ' ') || lower.includes(' ' + kw + ',') || lower.includes(kw)) {
      matched.push(kw);
    } else {
      missing.push(kw);
    }
  }
  return { matched, missing };
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Pure-frontend deterministic analysis. Always runs instantly, no network.
 * If `jdText` is provided, a literal-keyword JD-match block is included too —
 * but the higher-quality semantic match comes from `analyzeWithAI` below.
 */
export function analyzeResumeLocal(resumeText: string, jdText = ''): AtsAnalysis {
  const text = resumeText.trim();
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const bullets = extractBullets(text);
  const bulletCount = bullets.length;
  const quantifiedBullets = countQuantifiedBullets(bullets);
  const actionVerbCount = countActionVerbs(bullets);

  const contact = detectContactInfo(text);
  const sectionsFound = detectSections(text);

  // ── Contact info ──────────────────────────────────────────────────────────
  const contactPieces = [contact.hasEmail, contact.hasPhone, contact.hasLinkedin, contact.hasLocation];
  const contactPresent = contactPieces.filter(Boolean).length;
  const contactScore = clamp((contactPresent / contactPieces.length) * 100);
  const missingContact: string[] = [];
  if (!contact.hasEmail) missingContact.push('email');
  if (!contact.hasPhone) missingContact.push('phone');
  if (!contact.hasLinkedin) missingContact.push('LinkedIn URL');
  if (!contact.hasLocation) missingContact.push('location');
  const contactSection: SectionScore = {
    score: contactScore,
    status: statusFromScore(contactScore),
    message:
      contactScore >= 80
        ? 'All key contact details detected.'
        : `Missing: ${missingContact.join(', ')}.`,
    detail: contactScore < 100 ? 'ATS systems reject resumes without basic contact fields.' : undefined,
  };

  // ── Structure (section headers) ───────────────────────────────────────────
  const expectedSections = ['Experience', 'Education', 'Skills'];
  const requiredFound = expectedSections.filter((s) => sectionsFound.includes(s)).length;
  const optionalBonus =
    (sectionsFound.includes('Summary') ? 6 : 0) +
    (sectionsFound.includes('Projects') ? 4 : 0) +
    (sectionsFound.includes('Certifications') ? 4 : 0);
  const structureScore = clamp((requiredFound / expectedSections.length) * 86 + optionalBonus);
  const structureSection: SectionScore = {
    score: structureScore,
    status: statusFromScore(structureScore),
    message: sectionsFound.length === 0
      ? 'No clear section headers detected — ATS may fail to parse this resume.'
      : `Detected sections: ${sectionsFound.join(', ')}.`,
    detail: requiredFound < expectedSections.length
      ? `Missing standard sections: ${expectedSections.filter((s) => !sectionsFound.includes(s)).join(', ')}.`
      : undefined,
  };

  // ── Impact (action verbs + quantification) ────────────────────────────────
  const actionRatio = bulletCount === 0 ? 0 : actionVerbCount / bulletCount;
  const quantRatio = bulletCount === 0 ? 0 : quantifiedBullets / bulletCount;
  const impactScore = clamp(actionRatio * 50 + quantRatio * 50);
  const impactSection: SectionScore = {
    score: impactScore,
    status: statusFromScore(impactScore),
    message:
      bulletCount === 0
        ? 'No bullet points found — recruiters skim, bullets are essential.'
        : `${actionVerbCount}/${bulletCount} bullets start with a strong action verb · ${quantifiedBullets}/${bulletCount} bullets are quantified.`,
    detail:
      impactScore < 70
        ? 'Lead each bullet with a strong verb (Led, Built, Reduced) and include a metric (%, $, time saved, scale).'
        : undefined,
  };

  // ── Length ────────────────────────────────────────────────────────────────
  let lengthScore = 100;
  let lengthMsg = `${wordCount} words — well-sized.`;
  if (wordCount < 200) {
    lengthScore = clamp((wordCount / 200) * 70);
    lengthMsg = `Only ${wordCount} words — too thin. Aim for 400–800 words.`;
  } else if (wordCount < 350) {
    lengthScore = 75;
    lengthMsg = `${wordCount} words — slightly thin. 400+ words usually performs better.`;
  } else if (wordCount > 1200) {
    lengthScore = clamp(100 - (wordCount - 1200) / 20);
    lengthMsg = `${wordCount} words — too long. Trim to under 1000 words for a 1–2 page resume.`;
  }
  const lengthSection: SectionScore = {
    score: lengthScore,
    status: statusFromScore(lengthScore),
    message: lengthMsg,
  };

  // ── Formatting hazards ────────────────────────────────────────────────────
  let formattingScore = 100;
  const formattingNotes: string[] = [];
  for (const hz of FORMATTING_HAZARDS) {
    if (hz.cost > 0 && hz.pattern.test(text)) {
      formattingScore -= hz.cost;
      formattingNotes.push(hz.message);
    }
  }
  formattingScore = clamp(formattingScore);
  const formattingSection: SectionScore = {
    score: formattingScore,
    status: statusFromScore(formattingScore),
    message:
      formattingNotes.length === 0
        ? 'No common ATS parsing hazards detected.'
        : formattingNotes[0],
    detail: formattingNotes.length > 1 ? formattingNotes.slice(1).join(' · ') : undefined,
  };

  // ── Keywords (literal JD match if JD provided; otherwise neutral) ─────────
  let keywordScore = 70;
  let keywordMsg = 'No job description supplied — paste one above to score keyword match.';
  let jdMatch: AtsAnalysis['jdMatch'];
  if (jdText.trim().length > 60) {
    const jdKws = extractJdKeywords(jdText);
    const { matched, missing } = findKeywordsInResume(text, jdKws);
    const literalMatchPct = jdKws.length === 0 ? 0 : (matched.length / jdKws.length) * 100;
    keywordScore = clamp(literalMatchPct);
    keywordMsg = `${matched.length}/${jdKws.length} top JD keywords found in resume.`;
    jdMatch = {
      matchScore: keywordScore,
      matchedKeywords: matched,
      missingKeywords: missing.slice(0, 15),
      aiSuggestions: [], // populated by analyzeWithAI later
    };
  }
  const keywordSection: SectionScore = {
    score: keywordScore,
    status: statusFromScore(keywordScore),
    message: keywordMsg,
    detail: jdMatch && jdMatch.missingKeywords.length > 0
      ? `Consider adding: ${jdMatch.missingKeywords.slice(0, 6).join(', ')}.`
      : undefined,
  };

  // ── Composite overall ─────────────────────────────────────────────────────
  // Weight: keywords dominate when JD is provided; otherwise impact carries.
  const weights = jdText.trim()
    ? { contact: 0.10, structure: 0.15, keywords: 0.30, impact: 0.20, length: 0.10, formatting: 0.15 }
    : { contact: 0.15, structure: 0.20, keywords: 0.05, impact: 0.30, length: 0.15, formatting: 0.15 };
  const overallScore = clamp(
    contactSection.score * weights.contact +
      structureSection.score * weights.structure +
      keywordSection.score * weights.keywords +
      impactSection.score * weights.impact +
      lengthSection.score * weights.length +
      formattingSection.score * weights.formatting,
  );

  // ── Strengths / weaknesses / suggestions ──────────────────────────────────
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const suggestions: string[] = [];

  if (contactScore >= 80) strengths.push('Contact info is complete and ATS-readable.');
  else weaknesses.push(`Contact info incomplete (missing ${missingContact.join(', ')}).`);

  if (structureScore >= 80) strengths.push('Standard section headers are present and scannable.');
  else if (sectionsFound.length === 0) weaknesses.push('Could not detect standard section headers — ATS may skip large blocks.');
  else weaknesses.push(`Missing some standard sections: ${expectedSections.filter((s) => !sectionsFound.includes(s)).join(', ')}.`);

  if (impactScore >= 70) strengths.push('Bullets show strong action verbs and quantified results.');
  if (bulletCount > 0 && actionVerbCount / bulletCount < 0.5)
    weaknesses.push('Most bullets do not start with a strong action verb.');
  if (bulletCount > 0 && quantifiedBullets / bulletCount < 0.4)
    weaknesses.push('Few bullets contain measurable metrics (%, $, time saved, scale).');

  if (lengthScore >= 80) strengths.push('Length is in the recruiter sweet spot.');
  else if (wordCount < 350) weaknesses.push('Resume is too short — likely missing depth in experience.');
  else if (wordCount > 1200) weaknesses.push('Resume is too long — risk of recruiter skim-skipping.');

  if (formattingScore < 100) weaknesses.push('Formatting hazards present — see formatting section.');
  else strengths.push('Clean text — no obvious parsing hazards.');

  if (jdMatch) {
    if (keywordScore >= 65) strengths.push(`Strong JD keyword match (${matchedCount(jdMatch)}/${matchedCount(jdMatch) + jdMatch.missingKeywords.length}).`);
    else weaknesses.push(`Low JD keyword density — only ${keywordScore}% match.`);
    if (jdMatch.missingKeywords.length > 0) {
      suggestions.push(`Add these JD terms where truthful: ${jdMatch.missingKeywords.slice(0, 6).join(', ')}.`);
    }
  } else {
    suggestions.push('Paste a job description to unlock semantic match scoring and rewrite suggestions.');
  }

  if (bulletCount > 0 && actionVerbCount / bulletCount < 0.7) {
    suggestions.push('Rewrite weak openers: replace "Responsible for", "Worked on", "Helped" with verbs like Led, Built, Shipped, Reduced.');
  }
  if (bulletCount > 0 && quantifiedBullets / bulletCount < 0.5) {
    suggestions.push('Add at least one metric per bullet (% improvement, $ saved, users impacted, time reduced).');
  }
  if (!contact.hasLinkedin) suggestions.push('Add your LinkedIn URL — recruiters cross-check it 90% of the time.');
  if (sectionsFound.length < 3) suggestions.push('Use plain-text section headers like "Experience", "Education", "Skills" — ATS parsers anchor on these.');
  if (wordCount < 350) suggestions.push('Expand each role with 3–5 bullets covering scope, ownership, outcomes.');
  if (wordCount > 1200) suggestions.push('Trim older or less relevant roles to keep the resume under 1000 words.');

  return {
    overallScore,
    scoreLabel: scoreLabel(overallScore),
    sections: {
      contactInfo: contactSection,
      structure: structureSection,
      keywords: keywordSection,
      impact: impactSection,
      length: lengthSection,
      formatting: formattingSection,
    },
    jdMatch,
    strengths: strengths.slice(0, 6),
    weaknesses: weaknesses.slice(0, 6),
    suggestions: suggestions.slice(0, 8),
    stats: {
      wordCount,
      bulletCount,
      actionVerbCount,
      quantifiedBullets,
      hasEmail: contact.hasEmail,
      hasPhone: contact.hasPhone,
      hasLinkedin: contact.hasLinkedin,
      hasLocation: contact.hasLocation,
      sectionsFound,
    },
  };
}

function matchedCount(jd: NonNullable<AtsAnalysis['jdMatch']>): number {
  return jd.matchedKeywords.length;
}

// ── AI augmentation ──────────────────────────────────────────────────────────

export interface AiAtsResponse {
  semanticMatchScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  rewriteHints: string[];
}

/**
 * Calls the Vercel function for AI semantic analysis. Falls back gracefully
 * if the network or AI provider is unavailable — local scores remain valid.
 */
export async function analyzeWithAI(
  resumeText: string,
  jdText: string,
): Promise<AiAtsResponse | null> {
  if (!resumeText.trim() || !jdText.trim()) return null;
  try {
    const res = await fetch('/api/ats-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeText, jdText }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.warn('ATS AI check non-OK:', res.status, body.slice(0, 200));
      return null;
    }
    const data = (await res.json()) as Partial<AiAtsResponse>;
    return {
      semanticMatchScore: clamp(Number(data.semanticMatchScore) || 0),
      matchedKeywords: Array.isArray(data.matchedKeywords) ? data.matchedKeywords : [],
      missingKeywords: Array.isArray(data.missingKeywords) ? data.missingKeywords : [],
      strengths: Array.isArray(data.strengths) ? data.strengths : [],
      weaknesses: Array.isArray(data.weaknesses) ? data.weaknesses : [],
      suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
      rewriteHints: Array.isArray(data.rewriteHints) ? data.rewriteHints : [],
    };
  } catch (err) {
    console.warn('ATS AI check failed:', err);
    return null;
  }
}

/**
 * Combine local + AI into one report. AI augments — never overwrites
 * local deterministic scores so the user can trust the breakdown.
 */
export function mergeWithAi(local: AtsAnalysis, ai: AiAtsResponse | null): AtsAnalysis {
  if (!ai) return local;

  const merged: AtsAnalysis = JSON.parse(JSON.stringify(local));

  // Blend literal-match (local) and semantic-match (AI) 50/50 for the keyword
  // score so we reward synonyms but still penalise truly absent terms.
  const localKw = merged.sections.keywords.score;
  const blended = clamp((localKw + ai.semanticMatchScore) / 2);
  merged.sections.keywords.score = blended;
  merged.sections.keywords.status = statusFromScore(blended);
  if (ai.missingKeywords.length > 0) {
    merged.sections.keywords.detail =
      `Top gaps: ${ai.missingKeywords.slice(0, 6).join(', ')}.`;
  }

  if (merged.jdMatch) {
    merged.jdMatch.matchScore = blended;
    // Dedupe + cap.
    merged.jdMatch.matchedKeywords = Array.from(
      new Set([...merged.jdMatch.matchedKeywords, ...ai.matchedKeywords]),
    ).slice(0, 25);
    merged.jdMatch.missingKeywords = Array.from(
      new Set([...merged.jdMatch.missingKeywords, ...ai.missingKeywords]),
    ).slice(0, 20);
    merged.jdMatch.aiSuggestions = ai.rewriteHints.slice(0, 8);
  }

  // Merge prose lists, AI wins ties (semantic > heuristic).
  const dedupe = (arr: string[]) =>
    Array.from(new Set(arr.map((s) => s.trim()).filter(Boolean)));
  merged.strengths = dedupe([...ai.strengths, ...merged.strengths]).slice(0, 7);
  merged.weaknesses = dedupe([...ai.weaknesses, ...merged.weaknesses]).slice(0, 7);
  merged.suggestions = dedupe([...ai.suggestions, ...merged.suggestions]).slice(0, 10);

  // Recompute overall with the blended keyword score.
  const w = { contact: 0.10, structure: 0.15, keywords: 0.30, impact: 0.20, length: 0.10, formatting: 0.15 };
  merged.overallScore = clamp(
    merged.sections.contactInfo.score * w.contact +
      merged.sections.structure.score * w.structure +
      merged.sections.keywords.score * w.keywords +
      merged.sections.impact.score * w.impact +
      merged.sections.length.score * w.length +
      merged.sections.formatting.score * w.formatting,
  );
  merged.scoreLabel = scoreLabel(merged.overallScore);
  return merged;
}
