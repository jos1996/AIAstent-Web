// ── AI Resume Tailoring ──────────────────────────────────────────────────────
// Simple fetch to OpenRouter API (same pattern as RapidAPI in JobSearchPage)
// Key: env var first, then hardcoded fallback

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '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';

const MODELS = [
  'google/gemma-4-26b-a4b-it:free',
  'mistralai/mistral-7b-instruct:free',
  'meta-llama/llama-3.1-8b-instruct:free',
  'deepseek/deepseek-chat-v3-0324:free',
];

export interface TailoredResume {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
  summary: string;
  skills: string[];
  experience: {
    title: string;
    company: string;
    duration: string;
    location: string;
    bullets: string[];
  }[];
  education: {
    degree: string;
    school: string;
    year: string;
    gpa: string;
  }[];
  projects: {
    name: string;
    description: string;
    tech: string;
    link: string;
  }[];
  certifications: string[];
  targetRole: string;
  matchKeywords: string[];
}

const buildPrompt = (resumeText: string, jdText: string) => `You are an expert ATS resume writer. Analyse the resume and job description and produce a TAILORED resume JSON.

STRICT RULES:
1. Extract ALL real data from the resume - name, email, phone, location, linkedin
2. Rewrite the summary (3 sentences) using exact keywords from the JD
3. Keep ALL experience entries - rewrite bullets to show measurable impact using JD keywords
4. Keep ALL education entries exactly as in the resume
5. Reorder skills: JD-matching skills first (max 14 total)
6. Keep ALL projects and certifications from the resume
7. Extract the exact target job title from the JD
8. Pick top 8 keywords from the JD that match the resume
9. Do NOT invent any company, date, degree or credential
10. Keep bullets concise - max 2 lines each, max 3 bullets per role

RESUME:
${resumeText.slice(0, 4000)}

JOB DESCRIPTION:
${jdText.slice(0, 2500)}

Return ONLY this JSON - no markdown, no explanation:
{
  "name": "full name",
  "email": "email",
  "phone": "phone",
  "location": "city, country",
  "linkedin": "linkedin url or empty string",
  "website": "portfolio url or empty string",
  "targetRole": "exact job title from JD",
  "summary": "3 sentence tailored summary with JD keywords",
  "skills": ["skill1","skill2"],
  "experience": [{"title":"Job Title","company":"Company","duration":"Mon Year - Mon Year","location":"City","bullets":["bullet1","bullet2","bullet3"]}],
  "education": [{"degree":"Degree","school":"University","year":"Year","gpa":""}],
  "projects": [{"name":"Project","description":"one line","tech":"Stack","link":""}],
  "certifications": ["cert1"],
  "matchKeywords": ["kw1","kw2","kw3","kw4","kw5","kw6","kw7","kw8"]
}`;

export async function tailorResumeWithAI(
  resumeText: string,
  jdText: string
): Promise<TailoredResume> {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API key not configured.');
  }

  const prompt = buildPrompt(resumeText, jdText);
  let lastError = 'All models failed';

  for (const model of MODELS) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://helplyai.co',
          'X-Title': 'HelplyAI Resume Builder',
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 3000,
          temperature: 0.2,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        lastError = `${model}: HTTP ${response.status} - ${JSON.stringify(data).slice(0, 200)}`;
        console.warn(lastError);
        continue;
      }

      const raw: string = data.choices?.[0]?.message?.content || '';
      if (!raw) { lastError = `${model}: empty response`; continue; }

      const start = raw.indexOf('{');
      const end = raw.lastIndexOf('}');
      if (start === -1 || end === -1) { lastError = `${model}: no JSON found`; continue; }

      const parsed = JSON.parse(raw.slice(start, end + 1)) as TailoredResume;
      parsed.skills = parsed.skills || [];
      parsed.experience = parsed.experience || [];
      parsed.education = parsed.education || [];
      parsed.projects = parsed.projects || [];
      parsed.certifications = parsed.certifications || [];
      parsed.matchKeywords = parsed.matchKeywords || [];
      parsed.website = parsed.website || '';
      parsed.linkedin = parsed.linkedin || '';
      return parsed;

    } catch (err) {
      lastError = `${model}: ${String(err)}`;
      console.warn(lastError);
    }
  }

  throw new Error(`Resume generation failed - ${lastError}`);
}
