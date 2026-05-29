import { NextResponse } from 'next/server';
import { validateBatch, sanitizeFilename } from '@/app/lib/fileValidator';
import { createSession, getSession } from '@/app/lib/sessionStore';

export async function POST(request) {
  try {
    const formData = await request.formData();

    // ── 1. Extract JD ─────────────────────────────────────────────────────
    let jdText = (formData.get('jd') || '').trim();

    const jdFile = formData.get('jdFile');
    if (!jdText && jdFile && jdFile.size > 0) {
      // Parse JD file immediately (it's just one file, fast)
      const { extractText } = await import('@/app/lib/fileParser');
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

    // ── 2. Extract resume files ────────────────────────────────────────────
    const resumeFiles = formData.getAll('resumes');

    if (!resumeFiles || resumeFiles.length === 0) {
      return NextResponse.json(
        { error: 'NO_RESUMES', message: 'At least one resume file is required.' },
        { status: 400 }
      );
    }

    // ── Deduplicate files in the batch by name (EC-01) ─────────────────────
    const seenNames = new Set();
    const uniqueResumeFiles = resumeFiles.filter(file => {
      const sanitized = sanitizeFilename(file.name);
      if (seenNames.has(sanitized)) return false;
      seenNames.add(sanitized);
      return true;
    });

    // ── 3. Validate ────────────────────────────────────────────────────────
    const validation = validateBatch(uniqueResumeFiles);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'VALIDATION_FAILED', message: validation.errors.join(' | ') },
        { status: 400 }
      );
    }

    // ── 4. Store raw file data in session — NO PARSING YET ─────────────────
    // We store base64 encoded buffers so the analyze route can access them.
    // This makes upload instant — heavy work happens during streaming analyze.
    const rawFiles = await Promise.all(
      uniqueResumeFiles.map(async (file) => {
        const filename = sanitizeFilename(file.name);
        const buffer   = Buffer.from(await file.arrayBuffer());
        return {
          filename,
          mimeType:   file.type,
          sizeBytes:  file.size,
          bufferB64:  buffer.toString('base64'), // store as base64 string
        };
      })
    );

    // ── 5. Create session ──────────────────────────────────────────────────
    const sessionId = createSession(jdText, rawFiles.length);
    const session   = getSession(sessionId);
    if (session) {
      session.rawFiles = rawFiles; // analyze route will parse + score these
    }

    return NextResponse.json({
      sessionId,
      status:       'ready',
      totalResumes: rawFiles.length,
      files: rawFiles.map((f) => ({
        filename:  f.filename,
        sizeBytes: f.sizeBytes,
      })),
    }, { status: 200 });

  } catch (err) {
    console.error('[/api/upload] Error:', err);
    return NextResponse.json(
      { error: 'SERVER_ERROR', message: 'Upload failed. Please try again.' },
      { status: 500 }
    );
  }
}
