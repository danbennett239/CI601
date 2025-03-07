// app/api/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '@/lib/services/auth/authService';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    const { accessToken, refreshToken } = await loginUser({ email, password });

    const response = NextResponse.json(
      { message: 'Login successful' },
      { status: 200 }
    );

    // Set the cookies in the response
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      path: '/',
      maxAge: 3600, // 1 hour
    });
    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      path: '/',
      maxAge: 604800, // 1 week
    });

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Authentication failed.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}