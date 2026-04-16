import type { Handler, HandlerEvent } from '@netlify/functions';

const OPENROUTER_KEY =
  process.env.OPENROUTER_API_KEY ||
  process.env.VITE_OPENROUTER_API_KEY ||
  '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';

const MODELS = [
  'openai/gpt-4o-mini',
  'deepseek/deepseek-chat-v3-0324:free',
  'mistralai/mistral-7b-instruct:free',
];

const PROMPT = (resumeText: string, jdText: string) => `You are an expert ATS resume writer. Analyse the resume and job description below and produce a TAILORED resume JSON.

STRICT RULES:
1. Extract ALL real data from the resume — name, email, phone, location, linkedin
2. Rewrite the summary (3 sentences max) using exact keywords from the JD
3. Keep ALL experience entries — rewrite bullets to match JD keywords and show measurable impact
4. Keep ALL education entries exactly as in resume
5. Reorder skills: JD-matching skills first, then others (max 14 total)
6. Keep ALL projects and certifications from resume
7. Extract the exact target job title from the JD
8. Pick the top 8 keywords from the JD that appear or relate to the resume
9. Do NOT invent any company, date, degree or credential — only rewrite wording
10. Resume must fit ONE page — keep bullets concise (max 2 lines each), max 3 bullets per role

RESUME:
${resumeText.slice(0, 4000)}

JOB DESCRIPTION:
${jdText.slice(0, 2500)}

Return ONLY this JSON — no markdown, no explanation, no extra text:
{
  "name": "full name from resume",
  "email": "email from resume",
  "phone": "phone from resume",
  "location": "city, country from resume",
  "linkedin": "linkedin url or empty string",
  "website": "portfolio url or empty string",
  "targetRole": "exact job title from JD",
  "summary": "3 sentence tailored summary with JD keywords",
  "skills": ["skill1","skill2","skill3"],
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "duration": "Mon Year – Mon Year",
      "location": "City",
      "bullets": ["concise impact bullet 1","concise impact bullet 2","concise impact bullet 3"]
    }
  ],
  "education": [
    {"degree": "Degree, Major", "school": "University Name", "year": "Year", "gpa": ""}
  ],
  "projects": [
    {"name": "Project Name", "description": "one line description", "tech": "Tech Stack", "link": ""}
  ],
  "certifications": ["cert1","cert2"],
  "matchKeywords": ["kw1","kw2","kw3","kw4","kw5","kw6","kw7","kw8"]
}`;

export const handler: Handler = async (event: HandlerEvent) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let resumeText = '';
  let jdText = '';

  try {
    const body = JSON.parse(event.body || '{}');
    resumeText = body.resumeText || '';
    jdText = body.jdText || '';
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid request body' }) };
  }

  if (!resumeText || !jdText) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'resumeText and jdText are required' }) };
  }

  const prompt = PROMPT(resumeText, jdText);
  let lastError = 'All models failed';

  for (const model of MODELS) {
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://helplyai.co',
          'X-Title': 'HelplyAI Resume Tailor',
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 3000,
          temperature: 0.2,
        }),
      });

      const responseText = await res.text();

      if (!res.ok) {
        lastError = `${model}: HTTP ${res.status} — ${responseText.slice(0, 200)}`;
        console.error(lastError);
        continue;
      }

      const data = JSON.parse(responseText);
      const raw: string = data.choices?.[0]?.message?.content || '';
      if (!raw) { lastError = `${model}: empty response`; continue; }

      const start = raw.indexOf('{');
      const end = raw.lastIndexOf('}');
      if (start === -1 || end === -1) { lastError = `${model}: no JSON object found`; continue; }

      const parsed = JSON.parse(raw.slice(start, end + 1));
      parsed.skills = parsed.skills || [];
      parsed.experience = parsed.experience || [];
      parsed.education = parsed.education || [];
      parsed.projects = parsed.projects || [];
      parsed.certifications = parsed.certifications || [];
      parsed.matchKeywords = parsed.matchKeywords || [];
      parsed.website = parsed.website || '';
      parsed.linkedin = parsed.linkedin || '';

      return { statusCode: 200, headers, body: JSON.stringify(parsed) };

    } catch (err) {
      lastError = `${model}: ${String(err)}`;
      console.error(lastError);
    }
  }

  return {
    statusCode: 500,
    headers,
    body: JSON.stringify({ error: `Resume generation failed — ${lastError}` }),
  };
};
