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

const buildPrompt = (resumeText: string, jdText: string) => `You are an expert ATS resume writer. Your goal is to achieve 60-80% JD keyword density while keeping ALL original resume achievements.

STEP 1 - EXTRACT ALL JD KEYWORDS:
Extract every technical term, skill, tool, methodology, and requirement from the JD. Look for: skills, tools, frameworks, methodologies, domain terms, action verbs.

STEP 2 - KEYWORD INTEGRATION (60-80% MATCH):
- Rewrite EVERY bullet to include 1-3 relevant JD keywords naturally
- Summary must have 5-8 JD keywords
- Skills must include 70% from JD + 30% from resume
- Use exact terminology from JD (e.g., if JD says "cross-border payments", use that exact phrase)

STEP 3 - CONTENT PRESERVATION:
- Keep ALL original jobs, all bullets, all projects, all education, all certifications
- Do not remove any achievements - only enhance with keywords
- Keep original metrics and numbers
- Add 1-2 new bullets per role if JD has relevant requirements you can address

KEYWORD DENSITY REQUIREMENTS:
- Summary: 5-8 JD keywords in 3-4 sentences
- Each bullet: 1-3 JD keywords
- Skills: 70% from JD (12-16 total skills)
- matchKeywords: 12-15 top JD terms that appear in resume

FULL RESUME (parse everything):
${resumeText.slice(0, 8000)}

FULL JOB DESCRIPTION (extract all keywords from):
${jdText.slice(0, 4000)}

Return JSON with HIGH keyword density:
{
  "name": "full name",
  "email": "email",
  "phone": "phone",
  "location": "city, country",
  "linkedin": "linkedin url or empty string",
  "website": "portfolio url or empty string",
  "targetRole": "exact job title from JD",
  "summary": "keyword-rich summary with 5-8 JD terms integrated naturally",
  "skills": ["jd-skill1","jd-skill2","jd-skill3","resume-skill1","jd-skill4"],
  "experience": [{"title":"Job Title","company":"Company","duration":"Mon Year - Mon Year","location":"City","bullets":["bullet with 1-3 JD keywords","another bullet with JD terms","keyword-rich achievement"]}],
  "education": [{"degree":"Degree","school":"University","year":"Year","gpa":""}],
  "projects": [{"name":"Project","description":"description with JD keywords","tech":"Stack","link":""}],
  "certifications": ["cert1","cert2"],
  "matchKeywords": ["kw1","kw2","kw3","kw4","kw5","kw6","kw7","kw8","kw9","kw10","kw11","kw12"]
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
