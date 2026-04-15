import type { Handler, HandlerEvent } from '@netlify/functions';

const OPENROUTER_KEY = process.env.VITE_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY || '';

const MODELS = [
  'openai/gpt-4o-mini',
  'anthropic/claude-haiku',
  'deepseek/deepseek-chat-v3-0324:free',
  'mistralai/mistral-7b-instruct:free',
  'meta-llama/llama-3.1-8b-instruct:free',
];

export const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let resumeText = '';
  let jdText = '';

  try {
    const body = JSON.parse(event.body || '{}');
    resumeText = body.resumeText || '';
    jdText = body.jdText || '';
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body' }) };
  }

  if (!resumeText || !jdText) {
    return { statusCode: 400, body: JSON.stringify({ error: 'resumeText and jdText are required' }) };
  }

  const prompt = `You are an expert ATS resume writer. Tailor the candidate's resume for the job description.

Rules:
- Rewrite the professional summary to match the JD's language and priorities
- Reorder skills to put JD-matching ones first (max 12 skills)
- Rewrite each experience bullet to highlight relevant impact using JD keywords
- Do NOT invent new companies, roles, or dates — only rewrite existing content
- Extract the exact job title from the JD as targetRole
- Pick the top 8 keywords from the JD that match the resume

RESUME:
${resumeText.slice(0, 3500)}

JOB DESCRIPTION:
${jdText.slice(0, 2500)}

Return ONLY valid JSON, no markdown, no explanation:
{
  "name": "candidate full name from resume",
  "email": "email from resume",
  "phone": "phone from resume",
  "location": "city, country from resume",
  "linkedin": "linkedin url or empty string",
  "targetRole": "exact job title from JD",
  "summary": "2-3 sentence tailored summary using JD language",
  "skills": ["skill1","skill2",...up to 12],
  "experience": [
    {
      "title": "job title",
      "company": "company name",
      "duration": "Month Year – Month Year",
      "bullets": ["bullet 1","bullet 2","bullet 3"]
    }
  ],
  "education": [{"degree":"","school":"","year":""}],
  "projects": [{"name":"","description":"one line","tech":"tech stack"}],
  "certifications": ["cert1"],
  "matchKeywords": ["kw1","kw2",...8 keywords]
}`;

  let lastError = 'No models available';

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
          max_tokens: 2500,
          temperature: 0.3,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        lastError = `${model}: HTTP ${res.status} — ${errText.slice(0, 150)}`;
        console.error(lastError);
        continue;
      }

      const data = await res.json();
      const raw: string = data.choices?.[0]?.message?.content || '';
      if (!raw) { lastError = `${model}: empty response`; continue; }

      // Extract JSON from response
      const start = raw.indexOf('{');
      const end = raw.lastIndexOf('}');
      if (start === -1 || end === -1) { lastError = `${model}: no JSON found`; continue; }

      const jsonStr = raw.slice(start, end + 1);
      const parsed = JSON.parse(jsonStr);

      // Ensure arrays exist
      parsed.skills = parsed.skills || [];
      parsed.experience = parsed.experience || [];
      parsed.education = parsed.education || [];
      parsed.projects = parsed.projects || [];
      parsed.certifications = parsed.certifications || [];
      parsed.matchKeywords = parsed.matchKeywords || [];

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify(parsed),
      };
    } catch (err) {
      lastError = `${model}: ${String(err)}`;
      console.error(lastError);
      continue;
    }
  }

  return {
    statusCode: 500,
    body: JSON.stringify({ error: `Resume generation failed. ${lastError}` }),
  };
};
