// ── AI Resume Tailoring ───────────────────────────────────────────────────────
// Calls a Netlify serverless function that holds the API key server-side.
// This prevents 401 errors from exposed/exhausted frontend keys.

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
  const response = await fetch('/.netlify/functions/tailor-resume', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resumeText, jdText }),
  });

  if (!response.ok) {
    let errMsg = `Server error (${response.status})`;
    try {
      const errData = await response.json();
      errMsg = errData.error || errMsg;
    } catch { /* ignore */ }
    throw new Error(errMsg);
  }

  const data = await response.json();
  data.skills = data.skills || [];
  data.experience = data.experience || [];
  data.education = data.education || [];
  data.projects = data.projects || [];
  data.certifications = data.certifications || [];
  data.matchKeywords = data.matchKeywords || [];
  return data as TailoredResume;
}
