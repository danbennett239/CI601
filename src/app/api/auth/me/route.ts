import { NextResponse } from 'next/server';
import { getUserFromCookies } from '@/lib/utils/auth';

export async function GET() {
  const user = await getUserFromCookies();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ user });
}
