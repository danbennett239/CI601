// app/api/practices/[practiceId]/route.ts
import { NextResponse } from 'next/server';
import { fetchPracticeById } from '@/lib/services/practiceService';

export async function GET(
  request: Request,
  { params }: { params: { practiceId: string } }
) {
  if (!params.practiceId) {
    return NextResponse.json({ error: 'Practice ID is required' }, { status: 400 });
  }

  try {
    const practice = await fetchPracticeById(params.practiceId);
    if (!practice) {
      return NextResponse.json({ error: 'Practice not found' }, { status: 404 });
    }
    return NextResponse.json({ practice });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
