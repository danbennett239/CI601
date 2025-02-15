import { NextRequest, NextResponse } from "next/server";
import { getUserById } from "@/lib/services/userService";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params;
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch user.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}