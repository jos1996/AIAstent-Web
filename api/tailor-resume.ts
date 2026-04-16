import type { VercelRequest, VercelResponse } from "@vercel/node";

const OPENROUTER_KEY =
  process.env.OPENROUTER_API_KEY ||
  process.env.VITE_OPENROUTER_API_KEY ||
  "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";

const MODELS = [
  "openai/gpt-4o-mini",
  "deepseek/deepseek-chat-v3-0324:free",
  "mistralai/mistral-7b-instruct:free",
];

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { resumeText, jdText } = req.body || {};
  if (!resumeText || !jdText) {
    return res.status(400).json({ error: "resumeText and jdText are required" });
  }

  const prompt = buildPrompt(resumeText as string, jdText as string);
  let lastError = "All models failed";

  for (const model of MODELS) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://helplyai.co",
          "X-Title": "HelplyAI Resume Tailor",
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt }],
          max_tokens: 3000,
          temperature: 0.2,
        }),
      });

      const text = await response.text();
      if (!response.ok) {
        lastError = `${model}: HTTP ${response.status} - ${text.slice(0, 200)}`;
        console.error(lastError);
        continue;
      }

      const data = JSON.parse(text);
      const raw: string = data.choices?.[0]?.message?.content || "";
      if (!raw) { lastError = `${model}: empty response`; continue; }

      const start = raw.indexOf("{");
      const end = raw.lastIndexOf("}");
      if (start === -1 || end === -1) { lastError = `${model}: no JSON found`; continue; }

      const parsed = JSON.parse(raw.slice(start, end + 1));
      parsed.skills = parsed.skills || [];
      parsed.experience = parsed.experience || [];
      parsed.education = parsed.education || [];
      parsed.projects = parsed.projects || [];
      parsed.certifications = parsed.certifications || [];
      parsed.matchKeywords = parsed.matchKeywords || [];
      parsed.website = parsed.website || "";
      parsed.linkedin = parsed.linkedin || "";

      return res.status(200).json(parsed);
    } catch (err) {
      lastError = `${model}: ${String(err)}`;
      console.error(lastError);
    }
  }

  return res.status(500).json({ error: `Resume generation failed - ${lastError}` });
}
