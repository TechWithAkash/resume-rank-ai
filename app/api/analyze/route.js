import { NextResponse } from 'next/server';
import { validateBatch, sanitizeFilename } from '@/app/lib/fileValidator';
import { extractText, extractCandidateName } from '@/app/lib/fileParser';
import { scoreResume } from '@/app/lib/scoringService';
import { buildCandidateList } from '@/app/lib/rankingService';

export const maxDuration = 60; // Allow Vercel functions to run up to 60 seconds (Hobby tier max)

export async function POST(request) {
  try {
    const formData = await request.formData();

    // ── 1. Extract & Parse JD ─────────────────────────────────────────────
    let jdText = (formData.get('jd') || '').trim();
    const jdFile = formData.get('jdFile');
    
    if (!jdText && jdFile && jdFile.size > 0) {
      const jdBuffer = Buffer.from(await jdFile.arrayBuffer());
      const parsed = await extractText(jdBuffer, jdFile.name, jdFile.type);
      if (parsed.success) {
        jdText = parsed.text;
      } else {
        return NextResponse.json(
          { error: 'JD_PARSE_FAILED', message: `Could not read JD file: ${parsed.error}` },
          { status: 400 }
        );
      }
    }

    if (!jdText || jdText.length < 10) {
      return NextResponse.json(
        { error: 'NO_JD', message: 'Job description is required.' },
        { status: 400 }
      );
    }

    // ── 2. Extract Resumes ────────────────────────────────────────────────
    const resumeFiles = formData.getAll('resumes');
    if (!resumeFiles || resumeFiles.length === 0) {
      return NextResponse.json(
        { error: 'NO_RESUMES', message: 'At least one resume file is required.' },
        { status: 400 }
      );
    }

    // ── 3. Deduplicate Files in Batch (EC-01) ─────────────────────────────
    const seenNames = new Set();
    const uniqueResumeFiles = resumeFiles.filter((file) => {
      const sanitized = sanitizeFilename(file.name);
      if (seenNames.has(sanitized)) return false;
      seenNames.add(sanitized);
      return true;
    });

    // ── 4. Validate Batch ──────────────────────────────────────────────────
    const validation = validateBatch(uniqueResumeFiles);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'VALIDATION_FAILED', message: validation.errors.join(' | ') },
        { status: 400 }
      );
    }

    const stream = new ReadableStream({
      async start(controller) {
        const send = (data) => {
          try {
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`));
          } catch (_) { }
        };

        try {
          send({ type: 'start', total: uniqueResumeFiles.length });

          const parsedFiles = [];
          const scoringInputs = [];

          // ── PHASE 1: Parse all files sequentially (fast) ─────────────────
          for (let i = 0; i < uniqueResumeFiles.length; i++) {
            const file = uniqueResumeFiles[i];
            const filename = sanitizeFilename(file.name);
            send({ type: 'parsing', index: i + 1, total: uniqueResumeFiles.length, filename });

            try {
              const buffer = Buffer.from(await file.arrayBuffer());
              const { text, success, error } = await extractText(buffer, filename, file.type);
              const candidateName = extractCandidateName(text, filename);

              parsedFiles.push({ filename, candidateName, rawText: text, parseSuccess: success, parseError: error || null });
              scoringInputs.push({ filename, candidateName, resumeText: text, parseSuccess: success, parseError: error || null });
            } catch (err) {
              const candidateName = extractCandidateName('', filename);
              parsedFiles.push({ filename, candidateName, rawText: '', parseSuccess: false, parseError: err.message });
              scoringInputs.push({ filename, candidateName, resumeText: '', parseSuccess: false, parseError: err.message });
            }
          }

          send({ type: 'parsing_complete', total: uniqueResumeFiles.length });

          // ── PHASE 2: Score sequentially (1 at a time to avoid rate limits) ──
          const allResults = new Array(uniqueResumeFiles.length);

          for (let i = 0; i < scoringInputs.length; i++) {
            const input = scoringInputs[i];
            send({ type: 'scoring', index: i + 1, total: scoringInputs.length, filename: input.filename });

            if (!input.parseSuccess || !input.resumeText) {
              allResults[i] = {
                candidateName: input.candidateName,
                score: 0,
                matchedSkills: [],
                missingSkills: [],
                experienceRelevance: 'low',
                educationAlignment: 'weak',
                summary: 'Resume could not be parsed — ' + (input.parseError || 'no text extracted.'),
                topStrength: '',
                criticalGap: input.parseError || 'Parse failed',
                parseSuccess: false,
                parseError: input.parseError || 'Parse failed',
              };
            } else {
              try {
                allResults[i] = await scoreResume(input.resumeText, jdText, input.filename);
              } catch (err) {
                allResults[i] = {
                  candidateName: input.candidateName,
                  score: 0,
                  matchedSkills: [],
                  missingSkills: [],
                  experienceRelevance: 'low',
                  educationAlignment: 'weak',
                  summary: 'Scoring failed: ' + (err.message || 'Unknown error'),
                  topStrength: '',
                  criticalGap: err.message || 'Scoring error',
                  parseSuccess: false,
                  parseError: err.message,
                };
              }
            }

            send({
              type: 'progress',
              processed: i + 1,
              total: scoringInputs.length,
              filename: input.filename,
              score: allResults[i].score,
              name: allResults[i].candidateName,
            });

            // Micro-delay between API calls
            if (i < scoringInputs.length - 1) {
              await sleep(300);
            }
          }

          // ── PHASE 3: Rank Candidates ─────────────────────────────────────
          send({ type: 'ranking' });
          const rankedCandidates = buildCandidateList(parsedFiles, allResults);

          // Stream the complete candidates data list directly in the complete event payload
          send({ type: 'complete', total: rankedCandidates.length, candidates: rankedCandidates });

        } catch (err) {
          console.error('[/api/analyze] Stream execution error:', err);
          send({ type: 'error', message: err.message || 'Analysis processing failed.' });
        } finally {
          try { controller.close(); } catch (_) { }
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });

  } catch (err) {
    console.error('[/api/analyze] POST exception:', err);
    return NextResponse.json({ error: 'SERVER_ERROR', message: 'An unexpected processing error occurred.' }, { status: 500 });
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
