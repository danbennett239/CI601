// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { registerUser, loginUser } from "@/lib/services/auth/authService";

export async function POST(req: NextRequest) {
  try {
    const { first_name, last_name, email, password, role } = await req.json();

    // Register the user
    await registerUser({ first_name, last_name, email, password, role });

    // Log the user in immediately with default expiration (no rememberMe)
    const { accessToken, refreshToken } = await loginUser({ email, password, rememberMe: false });

    // Return a success response
    const response = NextResponse.json(
      { message: "Registration and login successful" },
      { status: 200 }
    );

    // Set cookies with fixed expiration (1 hour for access, 7 days for refresh)
    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      path: "/",
      maxAge: 60 * 60, // 1 hour
    });
    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Registration failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}