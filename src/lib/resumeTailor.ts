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

const buildPrompt = (resumeText: string, jdText: string) => `You are an expert ATS resume writer. Create a COMPREHENSIVE tailored resume that includes ALL original resume data PLUS enhancements from the JD.

CRITICAL RULES:
1. Extract EVERYTHING from the resume - all jobs, all bullets, all skills, all projects, all certifications
2. KEEP ALL original experience entries with their full bullet points (4-6 bullets per role is fine)
3. ENHANCE each bullet with JD keywords where relevant - but keep the original achievement
4. ADD new skills from JD that match your experience (merge resume skills + JD skills)
5. Rewrite summary to incorporate JD keywords AND your full experience
6. Keep ALL education, ALL certifications, ALL projects from original resume
7. Add JD-relevant achievements/bullets if they align with your experience (don't invent, but highlight relevant aspects)
8. Extract exact target job title from JD
9. Include 10-12 JD keywords that match the resume
10. MAXIMIZE content - more detail is better for ATS

FULL RESUME (parse everything):
${resumeText.slice(0, 8000)}

FULL JOB DESCRIPTION:
${jdText.slice(0, 4000)}

Return COMPLETE JSON with ALL data:
{
  "name": "full name",
  "email": "email",
  "phone": "phone",
  "location": "city, country",
  "linkedin": "linkedin url or empty string",
  "website": "portfolio url or empty string",
  "targetRole": "exact job title from JD",
  "summary": "comprehensive 3-4 sentence summary with JD keywords",
  "skills": ["skill1","skill2","skill3"],
  "experience": [{"title":"Job Title","company":"Company","duration":"Mon Year - Mon Year","location":"City","bullets":["bullet1","bullet2","bullet3","bullet4","bullet5"]}],
  "education": [{"degree":"Degree","school":"University","year":"Year","gpa":""}],
  "projects": [{"name":"Project","description":"detailed description","tech":"Stack","link":""}],
  "certifications": ["cert1","cert2"],
  "matchKeywords": ["kw1","kw2","kw3","kw4","kw5","kw6","kw7","kw8","kw9","kw10"]
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
