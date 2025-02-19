import { NextRequest, NextResponse } from "next/server";
import { inviteUser } from "@/lib/services/user/inviteService";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const email = body.email as string | undefined;
    const practiceId = body.practiceId as string | undefined;

    if (!email || !practiceId) {
      return NextResponse.json({ error: "Missing email or practiceId." }, { status: 400 });
    }

    await inviteUser(email, practiceId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in invite route:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
