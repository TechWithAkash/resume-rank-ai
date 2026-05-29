import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/sessionStore';

export async function GET(request, { params }) {
  try {
    const { sessionId } = await params;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'NO_SESSION_ID', message: 'sessionId is required.' },
        { status: 400 }
      );
    }

    const session = getSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: 'SESSION_NOT_FOUND', message: 'Session not found or expired.' },
        { status: 404 }
      );
    }

    // Return the session details (which include candidates, status, etc.)
    return NextResponse.json({
      sessionId: session.sessionId,
      status: session.status,
      totalCount: session.totalCount,
      processedCount: session.processedCount,
      candidates: session.candidates || [],
      error: session.error || null,
    });
  } catch (err) {
    console.error('[/api/results] Error fetching results:', err);
    return NextResponse.json(
      { error: 'SERVER_ERROR', message: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
