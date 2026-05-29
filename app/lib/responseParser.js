
/**
 * @typedef {Object} ScoringResult
 * @property {string}   candidateName
 * @property {number}   score                  - Integer 0–100
 * @property {string[]} matchedSkills
 * @property {string[]} missingSkills
 * @property {string}   experienceRelevance    - 'high' | 'medium' | 'low'
 * @property {string}   educationAlignment     - 'strong' | 'partial' | 'weak'
 * @property {string}   summary
 * @property {string}   topStrength
 * @property {string}   criticalGap
 * @property {boolean}  parseSuccess
 * @property {string}   [parseError]
 */

const VALID_EXPERIENCE = new Set(['high', 'medium', 'low']);
const VALID_EDUCATION   = new Set(['strong', 'partial', 'weak']);

/**
 * Parse and validate a raw Gemini response string.
 *
 * @param {string} rawText
 * @returns {ScoringResult}
 */
export function parseScoringResponse(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    return failResult('Empty or non-string response from LLM');
  }

  // Strip markdown code fences if present (```json ... ``` or ``` ... ```)
  const cleaned = rawText
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    // Try to extract JSON object substring as last resort
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        parsed = JSON.parse(match[0]);
      } catch {
        return failResult(`JSON parse failed: ${err.message}`);
      }
    } else {
      return failResult(`JSON parse failed: ${err.message}`);
    }
  }

  // Normalise and validate each field with safe defaults
  const score = clampScore(parsed.score);

  return {
    candidateName:
      typeof parsed.candidateName === 'string' && parsed.candidateName.trim()
        ? parsed.candidateName.trim()
        : 'Unknown',

    score,

    matchedSkills: normaliseStringArray(parsed.matchedSkills),
    missingSkills: normaliseStringArray(parsed.missingSkills),

    experienceRelevance: VALID_EXPERIENCE.has(parsed.experienceRelevance)
      ? parsed.experienceRelevance
      : 'low',

    educationAlignment: VALID_EDUCATION.has(parsed.educationAlignment)
      ? parsed.educationAlignment
      : 'weak',

    summary:
      typeof parsed.summary === 'string' ? parsed.summary.trim() : '',

    topStrength:
      typeof parsed.topStrength === 'string' ? parsed.topStrength.trim() : '',

    criticalGap:
      typeof parsed.criticalGap === 'string' ? parsed.criticalGap.trim() : '',

    parseSuccess: true,
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function failResult(error) {
  return {
    candidateName:        'Unknown',
    score:                0,
    matchedSkills:        [],
    missingSkills:        [],
    experienceRelevance:  'low',
    educationAlignment:   'weak',
    summary:              '',
    topStrength:          '',
    criticalGap:          '',
    parseSuccess:         false,
    parseError:           error,
  };
}

function clampScore(raw) {
  const n = Number(raw);
  if (isNaN(n)) return 0;
  return Math.round(Math.min(100, Math.max(0, n)));
}

function normaliseStringArray(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item) => typeof item === 'string' && item.trim().length > 0)
    .map((item) => item.trim());
}