import type { VercelRequest, VercelResponse } from '@vercel/node';

// Same OpenRouter key + model-cascade pattern as `tailor-resume.ts`.
// If the primary model fails (rate-limit, quota, transient error), we
// drop down through cheaper / free models so the user still gets a result.
const OPENROUTER_KEY =
  process.env.OPENROUTER_API_KEY ||
  process.env.VITE_OPENROUTER_API_KEY ||
  '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';

const MODELS = [
  'openai/gpt-4o-mini',
  'deepseek/deepseek-chat-v3-0324:free',
  'mistralai/mistral-7b-instruct:free',
];

const buildPrompt = (resumeText: string, jdText: string) => `You are an expert ATS (Applicant Tracking System) auditor with 10+ years of recruitment experience. Analyze the resume against the job description and produce a structured ATS report.

Your job is to be HONEST, SPECIFIC, and ACTIONABLE — not generic. Reference real phrases from the resume and JD. Do not invent facts about the candidate.

SCORING RUBRIC for semanticMatchScore (0-100):
- 85-100: Resume reads like it was written for this role. Most JD keywords and concepts are clearly represented with quantified evidence.
- 70-84: Strong overlap, a few clearly missing themes. Some bullets could be reworded to mirror JD language.
- 50-69: Partial overlap. Candidate is plausibly qualified but resume does not surface the right keywords for ATS ranking.
- 30-49: Weak overlap. Major JD themes absent. Will likely be filtered out.
- 0-29: Wrong-fit resume.

CRITICAL RULES:
1. matchedKeywords: 8–15 concrete phrases that appear in BOTH the resume and JD (not invented). Use phrases from the JD verbatim.
2. missingKeywords: 8–12 important phrases from the JD that are MISSING (or barely covered) in the resume. Only list things the JD truly emphasizes.
3. strengths: 3–5 specific, evidence-based observations (e.g. "Quantified impact in 4 of 5 most recent bullets").
4. weaknesses: 3–5 specific gaps (e.g. "No mention of Kubernetes despite being a core JD requirement").
5. suggestions: 4–6 prioritized improvements. Lead with the highest-impact change.
6. rewriteHints: 3–6 concrete bullet rewrites in "Before: … → After: …" format that demonstrate how to integrate missing keywords TRUTHFULLY.

RESUME:
${resumeText.slice(0, 6000)}

JOB DESCRIPTION:
${jdText.slice(0, 3500)}

Return ONLY this JSON — no markdown, no commentary:
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
  let lastError = 'All models failed';

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
                'You are a strict, honest ATS auditor. Output JSON only — no prose, no markdown fences.',
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
        lastError = `${model}: HTTP ${response.status} - ${text.slice(0, 200)}`;
        console.error('[ats-check]', lastError);
        continue;
      }

      const data = JSON.parse(text);
      const raw: string = data?.choices?.[0]?.message?.content ?? '';
      if (!raw) {
        lastError = `${model}: empty response`;
        continue;
      }

      const start = raw.indexOf('{');
      const end = raw.lastIndexOf('}');
      if (start === -1 || end === -1) {
        lastError = `${model}: no JSON found`;
        continue;
      }

      const parsed = JSON.parse(raw.slice(start, end + 1));
      const result = {
        semanticMatchScore: clamp(parsed.semanticMatchScore),
        matchedKeywords: asStringArray(parsed.matchedKeywords),
        missingKeywords: asStringArray(parsed.missingKeywords),
        strengths: asStringArray(parsed.strengths),
        weaknesses: asStringArray(parsed.weaknesses),
        suggestions: asStringArray(parsed.suggestions),
        rewriteHints: asStringArray(parsed.rewriteHints),
        model,
      };
      return res.status(200).json(result);
    } catch (err) {
      lastError = `${model}: ${String(err)}`;
      console.error('[ats-check]', lastError);
    }
  }

  return res.status(502).json({ error: `ATS check failed — ${lastError}` });
}
