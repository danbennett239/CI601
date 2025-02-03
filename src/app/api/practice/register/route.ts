// app/api/practice/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createPracticeWithUser } from '@/lib/services/practiceService';
import { loginUser } from '@/lib/services/authService';

export async function POST(req: NextRequest) {
  try {
    const {
      practiceName,
      email,
      password,
      phoneNumber,
      photo,
      address,
      openingHours,
    } = await req.json();

    // Create the practice and its user
    await createPracticeWithUser({
      practiceName,
      email,
      password,
      phoneNumber,
      photo,
      address,
      openingHours,
    });

    // Log the user in immediately
    const { accessToken, refreshToken } = await loginUser({ email, password });

    // Redirect to '/home' with cookies set
    const response = NextResponse.redirect(new URL('/home', req.url));
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      path: '/',
      maxAge: 3600,
    });
    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      path: '/',
      maxAge: 604800,
    });
    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Practice registration failed.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
