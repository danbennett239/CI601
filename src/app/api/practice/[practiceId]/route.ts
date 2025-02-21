// API for retrieving and updating practice settings, including image uploads.
import { NextResponse } from 'next/server';
import { fetchPracticeAndPreferencesById, updatePractice, updatePracticeSettingsWithPhoto } from '@/lib/services/practice/practiceService';

/**
 * Fetch practice details and preferences.
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ practiceId: string }> }) {
  try {
    const { practiceId } = await context.params;
    if (!practiceId) {
      return NextResponse.json({ error: 'Practice ID is required' }, { status: 400 });
    }

    const practice = await fetchPracticeAndPreferencesById(practiceId);
    if (!practice) {
      return NextResponse.json({ error: 'Practice not found' }, { status: 404 });
    }

    return NextResponse.json({ practice });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch practice.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * Update practice details.
 * - Supports both JSON-based updates and file uploads via `multipart/form-data`.
 */
export async function PUT(
  request: Request,
  context: { params: Promise<{ practiceId: string }> }) {
  try {
    const { practiceId } = await context.params;
    if (!practiceId) {
      return NextResponse.json({ error: "Practice ID is required" }, { status: 400 });
    }

    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      const settingsStr = formData.get("settings")?.toString() || "{}";
      const settings = JSON.parse(settingsStr);

      const { photoUrl } = await updatePracticeSettingsWithPhoto(practiceId, settings, file);
      return NextResponse.json({ photoUrl });
    } else {
      const body = await request.json();
      const { settings } = body;
      await updatePractice(practiceId, {
        practice_name: settings.practice_name,
        email: settings.email,
        phone_number: settings.phone_number,
        opening_hours: settings.opening_hours,
      });
      return NextResponse.json({ success: true });
    }
  } catch (error: unknown) {
    console.error("Error updating practice:", error);
    const message = error instanceof Error ? error.message : "Failed to update practice.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
