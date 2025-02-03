// app/api/refresh/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, signAccessToken } from '@/lib/utils/auth';

export async function GET(req: NextRequest) {
  const refreshToken = req.cookies.get('refreshToken')?.value;
  if (!refreshToken) {
    return NextResponse.json({ error: "No refresh token found." }, { status: 401 });
  }

  const payload = verifyToken(refreshToken);
  if (!payload) {
    return NextResponse.json({ error: "Invalid or expired refresh token." }, { status: 401 });
  }

  const newAccessToken = signAccessToken(payload);

  const res = NextResponse.json({ success: true });
  // Set the new access token cookie
  res.cookies.set('accessToken', newAccessToken, {
    httpOnly: true,
    secure: true,
    path: '/',
    maxAge: 3600,
  });
  return res;
}
