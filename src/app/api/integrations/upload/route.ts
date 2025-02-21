// Handles direct file uploads to S3 via a PUT request.
import { NextResponse } from "next/server";
import { uploadFileBuffer } from "@/lib/integrations/s3Service";

export async function PUT(request: Request) {
  try {
    // Parse the multipart form data.
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert the file to a Node.js Buffer (AWS SDK requires this format).
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);
    const fileName = file.name;
    const fileType = file.type || "application/octet-stream";

    const fileUrl = await uploadFileBuffer(fileBuffer, fileName, fileType);
    return NextResponse.json({ fileUrl });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown upload error";
    console.error("S3 Server-side Upload Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }

}
