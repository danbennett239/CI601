// /app/api/auth/forgot-password/route.ts
import { NextResponse } from "next/server";
import { sendForgotPasswordEmail } from "@/lib/services/auth/passwordService";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const response = await sendForgotPasswordEmail(email);
    console.log(response);
    return NextResponse.json({
      message: "If this email is associated with an account, a reset link has been sent.",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Forgot password error";
    console.error("Forgot password error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

