import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/sessionStore';

export async function GET(request, { params }) {
  try {
    const { sessionId } = await params;
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    if (!sessionId || !filename) {
      return new Response('Missing parameters', { status: 400 });
    }

    const session = getSession(sessionId);
    if (!session || !session.rawFiles) {
      return new Response('Session or files not found', { status: 404 });
    }

    const fileData = session.rawFiles.find((f) => f.filename === filename);
    if (!fileData) {
      return new Response('File not found', { status: 404 });
    }

    const buffer = Buffer.from(fileData.bufferB64, 'base64');

    return new Response(buffer, {
      headers: {
        'Content-Type': fileData.mimeType || 'application/octet-stream',
        'Content-Disposition': `inline; filename="${encodeURIComponent(filename)}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (err) {
    console.error('[/api/results/file] Error serving file:', err);
    return new Response('Internal Server Error', { status: 500 });
  }
}
