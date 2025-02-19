import { NextResponse } from 'next/server';
import { fetchPracticeAndPreferencesById } from '@/lib/services/practice/practiceService';

export async function GET(
  request: Request,
  context: { params: Promise<{ practiceId: string }> }
) {
  try {
    const { practiceId } = await context.params;

    if (!practiceId) {
      return NextResponse.json({ error: 'Practice ID is required' }, { status: 400 });
    }

    const practice = await fetchPracticeAndPreferencesById(practiceId);
    if (!practice) {
      return NextResponse.json({ error: 'Practice not found' }, { status: 404 });
    }

    return NextResponse.json({ practice });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch practice.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
