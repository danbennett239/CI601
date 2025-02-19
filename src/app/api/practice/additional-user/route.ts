import { NextRequest, NextResponse } from "next/server";
import { registerInvitedUser } from "@/lib/services/userService";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const token = body.token as string | undefined;
    const password = body.password as string | undefined;

    if (!token || !password) {
      return NextResponse.json({ error: "Missing token or password." }, { status: 400 });
    }

    await registerInvitedUser(token, password);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error finalizing invite:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
