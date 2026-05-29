/**
 * Build a resume scoring prompt.
 *
 * @param {string} resumeText - Extracted text from one resume
 * @param {string} jdText     - Job description text
 * @returns {string}          - Complete prompt string
 */
export function buildScoringPrompt(resumeText, jdText) {
    return `
You are an expert technical recruiter and senior hiring evaluator.

Your ONLY task is to evaluate how well the provided candidate resume matches the provided Job Description, and return a structured JSON score.

---

## JOB DESCRIPTION
${jdText.trim()}

---

## CANDIDATE RESUME
${resumeText.trim()}

---

## EVALUATION DIMENSIONS
Score the candidate across all four dimensions combined into a single 0–100 score:

1. Skills Match (35%) — Technical and domain skills present in resume vs. required in JD
2. Experience Relevance (30%) — Years, depth, and type of relevant work experience
3. Education Alignment (15%) — Degree, field, and level vs. JD expectations
4. Keyword Similarity (20%) — Presence of important JD keywords and phrases in resume

---

## OUTPUT INSTRUCTIONS
- Respond ONLY with a valid JSON object
- No preamble, explanation, markdown, or code fences
- Every field is REQUIRED — use empty arrays [] or empty strings "" if not applicable
- matchedSkills and missingSkills must contain ONLY skills explicitly present/absent in the RESUME TEXT above — do NOT invent skills
- Score must be an integer between 0 and 100

---

## REQUIRED JSON SCHEMA
{
  "candidateName": "<full name extracted from resume, or 'Unknown' if not found>",
  "score": <integer 0–100>,
  "matchedSkills": ["<skill explicitly in resume that JD requires>"],
  "missingSkills": ["<skill JD requires but absent from resume>"],
  "experienceRelevance": "<'high' | 'medium' | 'low'>",
  "educationAlignment": "<'strong' | 'partial' | 'weak'>",
  "summary": "<one sentence explaining why this score was assigned>",
  "topStrength": "<single most impressive matching factor>",
  "criticalGap": "<single most important missing requirement, or empty string if none>"
}

Remember: Return ONLY the JSON object. Nothing before it. Nothing after it.
`.trim();
}