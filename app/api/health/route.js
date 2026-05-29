import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({
      status: 'ok',
      uptime: Math.round(process.uptime()),
      version: '1.0.0',
      timestamp: new Date().toISOString()
    }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { status: 'error', message: err.message },
      { status: 500 }
    );
  }
}
