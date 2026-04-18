// ── AI Resume Tailoring ──────────────────────────────────────────────────────
// Uses Eden AI for resume generation (GPT-4o-mini)

const EDEN_AI_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiODFlMzM1NzktMDgzMS00MmIxLWIzN2UtNGU5ODIzZmRjOWNjIiwidHlwZSI6ImFwaV90b2tlbiJ9.bMugmLgEFLlnaw-1meQv4uLF_95wXj0BRkzODP0rshw';

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
  const prompt = buildPrompt(resumeText, jdText);

  try {
    const response = await fetch('https://api.edenai.run/v3/llm/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${EDEN_AI_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 3000,
        temperature: 0.2,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Eden AI error: HTTP ${response.status} - ${JSON.stringify(data).slice(0, 200)}`);
    }

    const raw: string = data.choices?.[0]?.message?.content || '';
    if (!raw) throw new Error('Empty response from Eden AI');

    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start === -1 || end === -1) throw new Error('No JSON found in response');

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
    console.error('Resume tailoring failed:', err);
    throw new Error(`Resume generation failed: ${String(err)}`);
  }
}
