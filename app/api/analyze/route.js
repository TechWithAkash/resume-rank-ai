import { NextResponse } from 'next/server';
import { getSession, failSession } from '@/app/lib/sessionStore';
import { extractText, extractCandidateName } from '@/app/lib/fileParser';
import { scoreResume } from '@/app/lib/scoringService';
import { buildCandidateList } from '@/app/lib/rankingService';

export async function POST(request) {
  try {
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'NO_SESSION_ID', message: 'sessionId is required.' }, { status: 400 });
    }

    const session = getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'SESSION_NOT_FOUND', message: 'Session not found or expired. Please re-upload.' }, { status: 404 });
    }

    if (!session.rawFiles || session.rawFiles.length === 0) {
      return NextResponse.json({ error: 'NO_FILES', message: 'No files found in session.' }, { status: 400 });
    }

    const { rawFiles, jdText } = session;

    const stream = new ReadableStream({
      async start(controller) {
        const send = (data) => {
          try {
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`));
          } catch (_) { }
        };

        try {
          send({ type: 'start', total: rawFiles.length });

          const parsedFiles = [];
          const scoringInputs = [];

          // ── PHASE 1: Parse all files first (fast, sequential) ────────────
          for (let i = 0; i < rawFiles.length; i++) {
            const raw = rawFiles[i];
            send({ type: 'parsing', index: i + 1, total: rawFiles.length, filename: raw.filename });

            try {
              const buffer = Buffer.from(raw.bufferB64, 'base64');
              const { text, success, error } = await extractText(buffer, raw.filename, raw.mimeType);
              const candidateName = extractCandidateName(text, raw.filename);

              parsedFiles.push({ filename: raw.filename, candidateName, rawText: text, parseSuccess: success, parseError: error || null });
              scoringInputs.push({ filename: raw.filename, candidateName, resumeText: text, parseSuccess: success });
            } catch (err) {
              const candidateName = extractCandidateName('', raw.filename);
              parsedFiles.push({ filename: raw.filename, candidateName, rawText: '', parseSuccess: false, parseError: err.message });
              scoringInputs.push({ filename: raw.filename, candidateName, resumeText: '', parseSuccess: false });
            }
          }

          send({ type: 'parsing_complete', total: rawFiles.length });

          // ── PHASE 2: Score sequentially (1 at a time to avoid timeouts) ──
          const allResults = new Array(rawFiles.length);

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
                summary: 'Resume could not be parsed — no text extracted.',
                topStrength: '',
                criticalGap: '',
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
                  criticalGap: '',
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

            // Small breathing room between Gemini calls
            if (i < scoringInputs.length - 1) {
              await sleep(300);
            }
          }

          // ── PHASE 3: Rank + save ──────────────────────────────────────────
          send({ type: 'ranking' });
          const rankedCandidates = buildCandidateList(parsedFiles, allResults);
          session.candidates = rankedCandidates;
          session.status = 'complete';
          session.processedCount = rawFiles.length;

          send({ type: 'complete', sessionId, total: rankedCandidates.length });

        } catch (err) {
          console.error('[/api/analyze] Stream error:', err);
          failSession(sessionId, err.message);
          send({ type: 'error', message: err.message || 'Analysis failed' });
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
    console.error('[/api/analyze] Unexpected error:', err);
    return NextResponse.json({ error: 'SERVER_ERROR', message: 'An unexpected error occurred.' }, { status: 500 });
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
