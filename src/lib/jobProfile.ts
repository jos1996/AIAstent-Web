// ── Job Application Profile — shared with the HelplyAI desktop overlay ──────
// Stored in public.job_profiles (one row per user, JSONB columns).
// The desktop Job Apply mode reads this table to fill application forms.
// Resume text comes from interview_context.resume (already saved on the
// dashboard) or a file upload — parsed into structured data ONCE per upload,
// never on every application (see Job Apply spec §4).

import { supabase } from './supabase';
import { EDEN_AI_KEY } from './resumeTailor';

export interface PersonalInfo {
  firstName: string; middleName: string; lastName: string; preferredName: string;
  email: string; phone: string; alternatePhone: string; dateOfBirth: string;
  gender: string; address: string; city: string; state: string; country: string;
  postalCode: string; linkedin: string; portfolio: string; github: string;
}

export interface EducationEntry {
  degree: string; specialization: string; institution: string; location: string;
  startDate: string; endDate: string; graduationYear: string; gpa: string;
}

export interface ExperienceEntry {
  company: string; title: string; location: string;
  startDate: string; endDate: string; responsibilities: string; achievements: string;
}

export interface LanguageEntry { language: string; proficiency: string; }
export interface CertificationEntry { name: string; issuer: string; date: string; }

export interface CareerPreferences {
  locations: string[]; workModel: string[]; willingToRelocate: boolean | null;
  employmentType: string[]; noticePeriod: string;
  expectedSalary: string; currentSalary: string; variablePay: string;
}

export interface WorkAuthorization {
  authorized: boolean | null; requiresSponsorship: boolean | null;
  visaStatus: string; notes: string;
}

export interface JobProfile {
  personal: PersonalInfo;
  education: EducationEntry[];
  experience: ExperienceEntry[];
  skills: string[];
  languages: LanguageEntry[];
  certifications: CertificationEntry[];
  preferences: CareerPreferences;
  workAuthorization: WorkAuthorization;
  professionalSummary: string;
  coverLetter: string;
  documents: { resumePath: string; coverLetterPath: string };
  extras: Record<string, string>;
}

export const EMPTY_JOB_PROFILE: JobProfile = {
  personal: {
    firstName: '', middleName: '', lastName: '', preferredName: '',
    email: '', phone: '', alternatePhone: '', dateOfBirth: '', gender: '',
    address: '', city: '', state: '', country: '', postalCode: '',
    linkedin: '', portfolio: '', github: '',
  },
  education: [], experience: [], skills: [], languages: [], certifications: [],
  preferences: {
    locations: [], workModel: [], willingToRelocate: null,
    employmentType: [], noticePeriod: '', expectedSalary: '', currentSalary: '', variablePay: '',
  },
  workAuthorization: { authorized: null, requiresSponsorship: null, visaStatus: '', notes: '' },
  professionalSummary: '', coverLetter: '',
  documents: { resumePath: '', coverLetterPath: '' },
  extras: {},
};

// ── CRUD ─────────────────────────────────────────────────────────────────────

const toStrArray = (v: unknown): string[] =>
  Array.isArray(v) ? v.map(String) : (typeof v === 'string' && v ? [v] : []);

export async function getJobProfile(userId: string): Promise<JobProfile> {
  const { data, error } = await supabase
    .from('job_profiles').select('*').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  if (!data) return structuredClone(EMPTY_JOB_PROFILE);
  const prefs = data.preferences || {};
  return {
    personal: { ...EMPTY_JOB_PROFILE.personal, ...(data.personal || {}) },
    education: data.education || [],
    experience: data.experience || [],
    skills: data.skills || [],
    languages: data.languages || [],
    certifications: data.certifications || [],
    preferences: {
      ...EMPTY_JOB_PROFILE.preferences, ...prefs,
      locations: toStrArray(prefs.locations),
      workModel: toStrArray(prefs.workModel),
      employmentType: toStrArray(prefs.employmentType),
    },
    workAuthorization: { ...EMPTY_JOB_PROFILE.workAuthorization, ...(data.work_authorization || {}) },
    professionalSummary: data.professional_summary || '',
    coverLetter: data.cover_letter || '',
    documents: { resumePath: data.resume_path || '', coverLetterPath: '' },
    extras: data.extras || {},
  };
}

// Mirror the extracted resume text into interview_context.resume so the
// Dashboard "Resume / CV" field shows the same resume the Job Profile parsed.
export async function saveResumeTextToContext(userId: string, resumeText: string): Promise<void> {
  const { error } = await supabase.from('interview_context').upsert(
    { user_id: userId, resume: resumeText, updated_at: new Date().toISOString() },
    { onConflict: 'user_id' },
  );
  if (error) console.warn('interview_context resume sync failed:', error.message);
}

export async function saveJobProfile(userId: string, profile: JobProfile): Promise<void> {
  const { error } = await supabase.from('job_profiles').upsert({
    user_id: userId,
    personal: profile.personal,
    education: profile.education,
    experience: profile.experience,
    skills: profile.skills,
    languages: profile.languages,
    certifications: profile.certifications,
    preferences: profile.preferences,
    work_authorization: profile.workAuthorization,
    professional_summary: profile.professionalSummary,
    cover_letter: profile.coverLetter,
    extras: profile.extras,
    resume_path: profile.documents.resumePath || null,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });
  if (error) throw error;
}

export async function uploadResumeFile(userId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop() || 'bin';
  const path = `${userId}/resume-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('job-documents').upload(path, file, { upsert: true });
  if (error) throw error;
  await supabase.from('job_profiles').upsert(
    { user_id: userId, resume_path: path, resume_uploaded_at: new Date().toISOString() },
    { onConflict: 'user_id' }
  );
  return path;
}

export async function markResumeProcessed(userId: string, resumePath: string): Promise<void> {
  await supabase.from('job_profiles')
    .update({ resume_path: resumePath, resume_processed_at: new Date().toISOString() })
    .eq('user_id', userId);
}

/** Fetch resume text already saved on the dashboard (interview_context). */
export async function getSavedResumeText(userId: string): Promise<string> {
  const { data } = await supabase
    .from('interview_context').select('resume').eq('user_id', userId).maybeSingle();
  return data?.resume || '';
}

// ── Resume file → text (pdf via pdfjs-dist, docx via mammoth, else plain) ────

export async function extractResumeText(file: File): Promise<string> {
  const name = file.name.toLowerCase();

  if (name.endsWith('.pdf')) {
    const pdfjs = await import('pdfjs-dist');
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url
    ).toString();
    const buf = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: buf }).promise;
    const parts: string[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      parts.push(content.items.map(it => 'str' in it ? it.str : '').join(' '));
    }
    return parts.join('\n').replace(/\s{3,}/g, ' ').trim();
  }

  if (name.endsWith('.docx')) {
    const mammoth = await import('mammoth');
    const buf = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer: buf });
    return result.value.trim();
  }

  return (await file.text()).trim();
}

// ── Resume text → structured JobProfile (ONE AI call, only on upload) ────────

const PARSE_PROMPT = `Extract structured data from this resume. Return ONLY valid JSON (no markdown, no commentary) matching EXACTLY this shape — use "" for unknown strings, [] for unknown lists, null for unknown booleans:

{
  "personal": {
    "firstName":"","middleName":"","lastName":"","preferredName":"",
    "email":"","phone":"","alternatePhone":"","dateOfBirth":"","gender":"",
    "address":"","city":"","state":"","country":"","postalCode":"",
    "linkedin":"","portfolio":"","github":""
  },
  "education":[{"degree":"","specialization":"","institution":"","location":"","startDate":"","endDate":"","graduationYear":"","gpa":""}],
  "experience":[{"company":"","title":"","location":"","startDate":"","endDate":"","responsibilities":["bullet point 1","bullet point 2"],"achievements":["achievement 1"]}],
  "skills":["skill1","skill2"],
  "languages":[{"language":"","proficiency":""}],
  "certifications":[{"name":"","issuer":"","date":""}],
  "preferences":{"locations":[],"workModel":[],"willingToRelocate":null,"employmentType":[],"noticePeriod":"","expectedSalary":"","currentSalary":"","variablePay":""},
  "workAuthorization":{"authorized":null,"requiresSponsorship":null,"visaStatus":"","notes":""},
  "professionalSummary":"",
  "extras":{"totalExperience":"","projects":"","awards":"","publications":""}
}

RULES:
- Never invent information. Leave fields empty if not in the resume.
- CAPTURE EVERYTHING: "responsibilities" and "achievements" MUST be arrays — copy EVERY bullet point from the resume VERBATIM as a separate array item. Do NOT summarize, merge, paraphrase, or drop bullets. If the resume lists 8 bullets for a role, the array has 8 items.
- professionalSummary: copy the resume's summary/objective section VERBATIM if present.
- Dates: "YYYY-MM" for startDate/endDate/graduation context; "YYYY-MM-DD" for dateOfBirth if a full date exists. Use "Present" for an ongoing role's endDate. graduationYear is just the year e.g. "2019".
- extras.totalExperience: e.g. "5 years" if inferable from dates.
- extras may contain other notable facts (projects, awards, publications) — include full details.

RESUME:
`;

export async function parseResumeToProfile(resumeText: string): Promise<Partial<JobProfile>> {
  if (!EDEN_AI_KEY) throw new Error('AI key not configured (VITE_EDEN_AI_KEY)');
  const res = await fetch('https://api.edenai.run/v3/llm/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${EDEN_AI_KEY}`,
      'Content-Type': 'application/json',
      'x-edenai-metadata': 'enabled',
    },
    body: JSON.stringify({
      model: 'openai/gpt-4o-mini',
      messages: [{ role: 'user', content: PARSE_PROMPT + resumeText.slice(0, 14000) }],
      max_tokens: 6000,
      temperature: 0,
      response_format: { type: 'json_object' },
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`EdenAI error ${res.status}: ${JSON.stringify(data).slice(0, 200)}`);
  const raw: string = data.choices?.[0]?.message?.content || '';
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Resume parse returned non-JSON');
  const parsed = JSON.parse(match[0]) as Partial<JobProfile>;

  // Normalize: AI returns bullets as arrays — join for textarea display;
  // workModel/employmentType may come back as strings — coerce to arrays.
  const bullets = (v: unknown): string =>
    Array.isArray(v) ? v.filter(Boolean).map(b => `• ${b}`).join('\n') : (typeof v === 'string' ? v : '');
  if (Array.isArray(parsed.experience)) {
    parsed.experience = parsed.experience.map(e => ({
      ...e,
      responsibilities: bullets(e.responsibilities),
      achievements: bullets(e.achievements),
    }));
  }
  if (parsed.preferences) {
    parsed.preferences = {
      ...parsed.preferences,
      workModel: toStrArray(parsed.preferences.workModel),
      employmentType: toStrArray(parsed.preferences.employmentType),
      locations: toStrArray(parsed.preferences.locations),
    };
  }
  return parsed;
}
