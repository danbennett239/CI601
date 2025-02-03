// app/api/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { registerUser, loginUser } from '@/lib/services/authService';

export async function POST(req: NextRequest) {
  try {
    const { first_name, last_name, email, password, role } = await req.json();
    
    // Register the user
    await registerUser({ first_name, last_name, email, password, role });
    
    // Log the user in immediately (note: loginUser does its own query to get the user)
    const { accessToken, refreshToken } = await loginUser({ email, password });
    
    // Return a redirect response to '/home' with cookies set
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
    const message = error instanceof Error ? error.message : 'Registration failed.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
