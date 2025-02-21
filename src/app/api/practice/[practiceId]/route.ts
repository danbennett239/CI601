import { NextResponse } from 'next/server';
import { fetchPracticeAndPreferencesById, updatePractice } from '@/lib/services/practice/practiceService';
import { deleteFileFromS3, uploadFileBuffer } from '@/lib/integrations/s3Service';

export async function GET(
  request: Request,
  context: { params: Promise<{ practiceId: string }> }
) {
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

export async function PUT(
  request: Request,
  context: { params: Promise<{ practiceId: string }> }
) {
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

      const existingPractice = await fetchPracticeAndPreferencesById(practiceId);
      if (!existingPractice) {
        return NextResponse.json({ error: "Practice not found" }, { status: 404 });
      }

      let photoUrl = existingPractice.photo || null;
      if (file) {
        const arrayBuffer = await file.arrayBuffer();
        const fileBuffer = Buffer.from(arrayBuffer);
        photoUrl = await uploadFileBuffer(fileBuffer, file.name, file.type);

        if (existingPractice.photo) {
          const keyToDelete = extractKeyFromS3Url(existingPractice.photo);
          if (keyToDelete) {
            await deleteFileFromS3(keyToDelete);
          }
        }
      }

      const updatedFields = {
        practice_name: settings.practice_name || existingPractice.practice_name,
        email: settings.email || existingPractice.email,
        phone_number: settings.phone_number || existingPractice.phone_number,
        opening_hours: settings.opening_hours || existingPractice.opening_hours,
        photo: photoUrl,
      };

      await updatePractice(practiceId, updatedFields);

      return NextResponse.json({ photoUrl });
    } else {
      const body = await request.json();
      const { settings } = body;

      if (!settings) {
        return NextResponse.json({ error: "No settings provided" }, { status: 400 });
      }

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


/** Helper to parse out the S3 key from e.g. "https://bucket.s3.region.amazonaws.com/uploads/myFile.png" */
function extractKeyFromS3Url(url: string): string | null {
  try {
    // Example: bucket.s3.region.amazonaws.com/ (we want everything after the domain)
    const match = url.match(/\.com\/(.+)$/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}