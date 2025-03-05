import { NextRequest, NextResponse } from 'next/server';
import { kafka } from '../../lib/kafka';
export async function POST(req: NextRequest) {
  try {
    const event = await req.json();
    await kafka.sendEvent(event);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: `Event processing failed with error: ${error}` },
      { status: 500 }
    );
  }
}