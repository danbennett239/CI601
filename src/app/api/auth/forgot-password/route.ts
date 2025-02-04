// /app/api/auth/forgot-password/route.ts
import { NextResponse } from "next/server";
import { sendForgotPasswordEmail } from "@/lib/services/passwordService";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const response = await sendForgotPasswordEmail(email);
    console.log(response);
    return NextResponse.json({
      message: "If this email is associated with an account, a reset link has been sent.",
    });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
