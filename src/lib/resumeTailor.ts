// ── AI Resume Tailoring ───────────────────────────────────────────────────────
// Uses OpenRouter (gpt-4o-mini → deepseek fallback) to tailor resume vs JD.

const OPENROUTER_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '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';

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

  const models = ['openai/gpt-4o-mini', 'deepseek/deepseek-chat-v3-0324', 'mistralai/mistral-7b-instruct'];
  let lastError = '';

  for (const model of models) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
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

      if (!response.ok) {
        const errBody = await response.text();
        lastError = `HTTP ${response.status}: ${errBody.slice(0, 200)}`;
        console.warn(`Model ${model} failed:`, lastError);
        continue;
      }

      const data = await response.json();
      const raw = data.choices?.[0]?.message?.content || '';

      if (!raw) { lastError = 'Empty response from AI'; continue; }

      // Strip markdown code fences
      const cleaned = raw
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();

      // Find first { to handle any preamble text
      const jsonStart = cleaned.indexOf('{');
      const jsonEnd = cleaned.lastIndexOf('}');
      if (jsonStart === -1 || jsonEnd === -1) { lastError = 'No JSON in response'; continue; }
      const jsonStr = cleaned.slice(jsonStart, jsonEnd + 1);

      try {
        const parsed = JSON.parse(jsonStr) as TailoredResume;
        // Ensure required arrays exist
        parsed.skills = parsed.skills || [];
        parsed.experience = parsed.experience || [];
        parsed.education = parsed.education || [];
        parsed.projects = parsed.projects || [];
        parsed.certifications = parsed.certifications || [];
        parsed.matchKeywords = parsed.matchKeywords || [];
        return parsed;
      } catch (parseErr) {
        lastError = 'JSON parse failed: ' + String(parseErr);
        continue;
      }
    } catch (fetchErr) {
      lastError = 'Network error: ' + String(fetchErr);
      continue;
    }
  }

  throw new Error(`Resume generation failed. ${lastError}`);
}
