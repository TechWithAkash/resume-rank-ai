/**
 * Rank an array of candidate results by score (highest first).
 *
 * @param {Array<Object>} candidates - Array of scoring results with metadata
 * @returns {Array<Object>} - Same array sorted and annotated with `rank`
 */
export function rankCandidates(candidates) {
    if (!candidates || candidates.length === 0) return [];

    // Sort descending by score, then alphabetically by name as tiebreaker
    const sorted = [...candidates].sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return (a.candidateName || '').localeCompare(b.candidateName || '');
    });

    // Assign ranks — ties get the same rank; next rank skips appropriately
    let currentRank = 1;
    for (let i = 0; i < sorted.length; i++) {
        if (i > 0 && sorted[i].score === sorted[i - 1].score) {
            sorted[i].rank = sorted[i - 1].rank; // same rank as previous
        } else {
            sorted[i].rank = currentRank;
        }
        currentRank = i + 2; // next potential rank
    }

    return sorted;
}

/**
 * Merge file metadata with scoring results into a unified candidate object.
 *
 * @param {Array<{ filename: string, candidateName: string, parseSuccess: boolean, parseError?: string, rawText: string }>} parsedFiles
 * @param {Array<ScoringResult>} scoringResults
 * @returns {Array<Object>}
 */
export function buildCandidateList(parsedFiles, scoringResults) {
    const merged = parsedFiles.map((file, index) => {
        const scoring = scoringResults[index] || {};
        return {
            filename: file.filename,
            candidateName: scoring.candidateName || file.candidateName || 'Unknown',
            score: scoring.score ?? 0,
            matchedSkills: scoring.matchedSkills || [],
            missingSkills: scoring.missingSkills || [],
            experienceRelevance: scoring.experienceRelevance || 'low',
            educationAlignment: scoring.educationAlignment || 'weak',
            summary: scoring.summary || '',
            topStrength: scoring.topStrength || '',
            criticalGap: scoring.criticalGap || '',
            parseSuccess: file.parseSuccess,
            parseError: file.parseError || null,
            scoringSuccess: scoring.parseSuccess ?? false,
            scoringError: scoring.parseError || null,
            rawTextPreview: (file.rawText || '').slice(0, 500), // for preview modal
        };
    });

    return rankCandidates(merged);
}