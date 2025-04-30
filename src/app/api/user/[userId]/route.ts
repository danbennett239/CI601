import { NextRequest, NextResponse } from "next/server";
import { getUserById } from "@/lib/services/user/userService";
import { getUserFromCookies } from "@/lib/utils/auth";
import { updateUserEmail } from "@/lib/services/user/userService";

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

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params;
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const currentUser = await getUserFromCookies();
    if (!currentUser || currentUser.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { settings } = await request.json();
    if (!settings || !settings.email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    const result = await updateUserEmail(userId, settings.email, currentUser);

    let response = NextResponse.json({ success: true });
    if (result.accessToken && result.refreshToken) {
      response = NextResponse.json({ success: true }, {
        headers: {
          'Set-Cookie': [
            `accessToken=${result.accessToken}; Path=/; HttpOnly; SameSite=Strict`,
            `refreshToken=${result.refreshToken}; Path=/; HttpOnly; SameSite=Strict`,
          ].join(','),
        },
      });
    }

    return response;
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to update email";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}