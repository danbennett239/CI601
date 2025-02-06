// /app/api/auth/reset-password/route.ts
import { NextResponse } from "next/server";
import { resetPassword } from "@/lib/services/passwordService";

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();
    await resetPassword(token, password);
    return NextResponse.json({ message: "Password reset successful" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Reset password error";
    console.error("Reset password error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
