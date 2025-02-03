import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const response = NextResponse.json({ success: true, message: "Logged out successfully." });

  // Clear the accessToken and refreshToken cookies
  response.cookies.set('accessToken', '', {
    httpOnly: true,
    secure: true,
    path: '/',
    expires: new Date(0), // Expire immediately
  });

  response.cookies.set('refreshToken', '', {
    httpOnly: true,
    secure: true,
    path: '/',
    expires: new Date(0), // Expire immediately
  });

  return response;
}