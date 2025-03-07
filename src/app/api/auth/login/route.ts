// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { loginUser } from "@/lib/services/auth/authService";

export async function POST(req: NextRequest) {
  try {
    const { email, password, rememberMe } = await req.json();
    const { accessToken, refreshToken } = await loginUser({ email, password, rememberMe });

    const response = NextResponse.json(
      { message: "Login successful" },
      { status: 200 }
    );

    // Set cookie expiration based on rememberMe
    const accessTokenMaxAge = rememberMe ? 7 * 24 * 60 * 60 : 60 * 60; // 7 days vs 1 hour
    const refreshTokenMaxAge = rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60; // 30 days vs 7 days

    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      path: "/",
      maxAge: accessTokenMaxAge,
    });
    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      path: "/",
      maxAge: refreshTokenMaxAge,
    });

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Authentication failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}