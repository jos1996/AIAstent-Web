import type { VercelRequest, VercelResponse } from '@vercel/node';

// EdenAI is the primary provider — same key/pattern as `src/lib/resumeTailor.ts`
// which is already in production. OpenRouter is the fallback if Eden errors.
// Both can be overridden via Vercel env vars without code changes.
const EDEN_AI_KEY =
  process.env.EDEN_AI_KEY ||
  process.env.VITE_EDEN_AI_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiODFlMzM1NzktMDgzMS00MmIxLWIzN2UtNGU5ODIzZmRjOWNjIiwidHlwZSI6ImFwaV90b2tlbiJ9.bMugmLgEFLlnaw-1meQv4uLF_95wXj0BRkzODP0rshw';

const OPENROUTER_KEY =
  process.env.OPENROUTER_API_KEY ||
  process.env.VITE_OPENROUTER_API_KEY ||
  '';

const buildPrompt = (resumeText: string, jdText: string) => `You are an expert ATS (Applicant Tracking System) auditor with 10+ years of recruitment experience. Analyze the resume against the job description and produce a structured ATS report.

Be HONEST, SPECIFIC, and ACTIONABLE. Reference real phrases from the resume and JD. Do not invent facts about the candidate.

SCORING RUBRIC for semanticMatchScore (0-100):
- 85-100: Resume reads like it was written for this role. Most JD keywords and concepts are clearly represented with quantified evidence.
- 70-84: Strong overlap, a few clearly missing themes. Some bullets could be reworded to mirror JD language.
- 50-69: Partial overlap. Candidate is plausibly qualified but resume does not surface the right keywords for ATS ranking.
- 30-49: Weak overlap. Major JD themes absent. Will likely be filtered out.
- 0-29: Wrong-fit resume.

RULES:
1. matchedKeywords: 8-15 concrete phrases that appear in BOTH the resume and JD. Use phrases from the JD verbatim where possible.
2. missingKeywords: 8-12 important phrases from the JD that are MISSING (or barely covered) in the resume. Only list things the JD truly emphasizes.
3. strengths: 3-5 specific, evidence-based observations (e.g. "Quantified impact in 4 of 5 most recent bullets").
4. weaknesses: 3-5 specific gaps (e.g. "No mention of Kubernetes despite being a core JD requirement").
5. suggestions: 4-6 prioritized improvements. Lead with the highest-impact change.
6. rewriteHints: 3-6 concrete bullet rewrites in "Before: ... -> After: ..." format that demonstrate how to integrate missing keywords TRUTHFULLY.

RESUME:
${resumeText.slice(0, 6000)}

JOB DESCRIPTION:
${jdText.slice(0, 3500)}

Return ONLY this JSON. No markdown, no commentary, no code fences:
{
  "semanticMatchScore": 0,
  "matchedKeywords": ["..."],
  "missingKeywords": ["..."],
  "strengths": ["..."],
  "weaknesses": ["..."],
  "suggestions": ["..."],
  "rewriteHints": ["Before: ... -> After: ..."]
}`;

function setCorsHeaders(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function clamp(n: unknown): number {
  const x = Number(n);
  if (!Number.isFinite(x)) return 0;
  return Math.max(0, Math.min(100, Math.round(x)));
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x) => (typeof x === 'string' ? x.trim() : ''))
    .filter(Boolean)
    .slice(0, 20);
}

function extractJsonObject(raw: string): string | null {
  // Strip markdown code fences (```json ... ``` or ``` ... ```).
  const stripped = raw.replace(/```(?:json)?\s*([\s\S]*?)```/g, '$1');
  const start = stripped.indexOf('{');
  const end = stripped.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  return stripped.slice(start, end + 1);
}

function shapeResult(parsed: any, providerLabel: string) {
  return {
    semanticMatchScore: clamp(parsed.semanticMatchScore),
    matchedKeywords: asStringArray(parsed.matchedKeywords),
    missingKeywords: asStringArray(parsed.missingKeywords),
    strengths: asStringArray(parsed.strengths),
    weaknesses: asStringArray(parsed.weaknesses),
    suggestions: asStringArray(parsed.suggestions),
    rewriteHints: asStringArray(parsed.rewriteHints),
    provider: providerLabel,
  };
}

async function callEdenAI(prompt: string): Promise<any | null> {
  if (!EDEN_AI_KEY) return null;
  try {
    const response = await fetch('https://api.edenai.run/v3/llm/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${EDEN_AI_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are a strict, honest ATS auditor. Output JSON only — no prose, no markdown fences, no commentary.',
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 1800,
        temperature: 0.2,
      }),
    });

    const text = await response.text();
    if (!response.ok) {
      console.error('[ats-check] EdenAI HTTP', response.status, text.slice(0, 200));
      return null;
    }
    const data = JSON.parse(text);
    const raw: string = data?.choices?.[0]?.message?.content ?? '';
    const json = extractJsonObject(raw);
    if (!json) return null;
    return JSON.parse(json);
  } catch (err) {
    console.error('[ats-check] EdenAI threw:', err);
    return null;
  }
}

async function callOpenRouter(prompt: string): Promise<any | null> {
  if (!OPENROUTER_KEY) return null;
  const MODELS = [
    'openai/gpt-4o-mini',
    'deepseek/deepseek-chat-v3-0324:free',
    'mistralai/mistral-7b-instruct:free',
  ];
  for (const model of MODELS) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${OPENROUTER_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://helplyai.co',
          'X-Title': 'HelplyAI ATS Check',
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content:
                'You are a strict, honest ATS auditor. Output JSON only.',
            },
            { role: 'user', content: prompt },
          ],
          max_tokens: 1800,
          temperature: 0.2,
          response_format: { type: 'json_object' },
        }),
      });
      const text = await response.text();
      if (!response.ok) {
        console.error('[ats-check] OpenRouter', model, response.status, text.slice(0, 200));
        continue;
      }
      const data = JSON.parse(text);
      const raw: string = data?.choices?.[0]?.message?.content ?? '';
      const json = extractJsonObject(raw);
      if (!json) continue;
      return JSON.parse(json);
    } catch (err) {
      console.error('[ats-check] OpenRouter', model, 'threw:', err);
    }
  }
  return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { resumeText, jdText } = (req.body ?? {}) as { resumeText?: string; jdText?: string };
  if (typeof resumeText !== 'string' || !resumeText.trim()) {
    return res.status(400).json({ error: 'resumeText is required' });
  }
  if (typeof jdText !== 'string' || !jdText.trim()) {
    return res.status(400).json({ error: 'jdText is required' });
  }
  if (resumeText.length > 20_000 || jdText.length > 10_000) {
    return res.status(413).json({ error: 'Input too large; trim resume or JD.' });
  }

  const prompt = buildPrompt(resumeText, jdText);

  // Try EdenAI first (proven working with the existing Resume Builder), then
  // OpenRouter as fallback. Both providers can be overridden via env vars.
  const eden = await callEdenAI(prompt);
  if (eden) return res.status(200).json(shapeResult(eden, 'edenai/gpt-4o-mini'));

  const or = await callOpenRouter(prompt);
  if (or) return res.status(200).json(shapeResult(or, 'openrouter'));

  return res.status(502).json({
    error:
      'AI ATS scorer is temporarily unavailable. Your local ATS report is still accurate — try the AI scorer again in a minute.',
  });
}
