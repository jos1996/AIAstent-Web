// ── AI Resume Tailoring ───────────────────────────────────────────────────────
// Uses OpenRouter (gpt-4o-mini) to tailor a resume against a Job Description.

const OPENROUTER_KEY = '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';

export interface TailoredResume {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  summary: string;
  skills: string[];
  experience: {
    title: string;
    company: string;
    duration: string;
    bullets: string[];
  }[];
  education: {
    degree: string;
    school: string;
    year: string;
  }[];
  projects: {
    name: string;
    description: string;
    tech: string;
  }[];
  certifications: string[];
  targetRole: string;
  matchKeywords: string[];
}

export async function tailorResumeWithAI(
  resumeText: string,
  jdText: string
): Promise<TailoredResume> {
  const prompt = `You are an expert resume writer and ATS optimization specialist.

TASK: Tailor the candidate's resume specifically for the job description below. 
- Rewrite the summary to align with the JD's priorities
- Reorder and emphasize skills that match the JD keywords
- Rewrite experience bullets to highlight relevant impact using JD language
- Keep all facts true — do NOT invent experience or companies
- Make it ATS-friendly: use exact keywords from the JD

RESUME:
${resumeText.slice(0, 3000)}

JOB DESCRIPTION:
${jdText.slice(0, 2000)}

Return ONLY valid JSON (no markdown, no code blocks) matching this exact schema:
{
  "name": "Full Name",
  "email": "email@example.com",
  "phone": "+91 XXXXXXXXXX",
  "location": "City, Country",
  "linkedin": "linkedin.com/in/username or empty string",
  "summary": "2-3 sentence tailored professional summary",
  "skills": ["skill1", "skill2", ...max 12 skills prioritized by JD match],
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "duration": "Month Year – Month Year",
      "bullets": ["achievement bullet 1", "achievement bullet 2", "achievement bullet 3"]
    }
  ],
  "education": [
    { "degree": "Degree Name", "school": "University Name", "year": "Year" }
  ],
  "projects": [
    { "name": "Project Name", "description": "1-line description", "tech": "Tech stack" }
  ],
  "certifications": ["cert1", "cert2"],
  "targetRole": "Exact job title from JD",
  "matchKeywords": ["keyword1", "keyword2", ...top 8 keywords matched from JD]
}`;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://helplyai.co',
      'X-Title': 'HelplyAI Resume Tailor',
    },
    body: JSON.stringify({
      model: 'openai/gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2000,
      temperature: 0.3,
    }),
  });

  if (!response.ok) throw new Error('AI service unavailable. Please try again.');

  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content || '';

  // Strip any markdown code fences if present
  const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

  try {
    return JSON.parse(cleaned) as TailoredResume;
  } catch {
    throw new Error('Failed to parse AI response. Please try again.');
  }
}
