// /app/api/auth/reset-password/route.ts
import { NextResponse } from "next/server";
import { resetPassword } from "@/lib/services/passwordService";

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();
    await resetPassword(token, password);
    return NextResponse.json({ message: "Password reset successful" });
  } catch (error: any) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: error.message || "An error occurred" }, { status: 400 });
  }
}
