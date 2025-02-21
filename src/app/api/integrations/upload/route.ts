import { NextResponse } from "next/server";
import { generatePresignedUploadUrl } from "@/lib/integrations/s3Service";

interface PresignedRequestBody {
  filename: string;
  filetype: string;
}

export async function POST(request: Request) {
  try {
    const { filename, filetype }: PresignedRequestBody = await request.json();

    if (!filename || !filetype) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { uploadUrl, fileUrl } = await generatePresignedUploadUrl(filename, filetype);

    return NextResponse.json({ uploadUrl, fileUrl });
  } catch (error) {
    console.error("S3 Upload Error:", error);
    return NextResponse.json({ error: "Failed to generate pre-signed URL" }, { status: 500 });
  }
}

// app/api/integrations/upload/route.ts (Next.js 13+)

import { uploadFileBuffer } from "@/lib/integrations/s3Service";

export async function PUT(request: Request) {
  try {
    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null; // from <input type="file" />

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert the File (Browser File) to a Node Buffer
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // Use name & type from the File object
    const fileName = file.name;
    const fileType = file.type || "application/octet-stream";

    // Upload to S3 (server-side)
    const fileUrl = await uploadFileBuffer(fileBuffer, fileName, fileType);

    // Return the final S3 URL to the client
    return NextResponse.json({ fileUrl });
  } catch (error) {
    console.error("S3 Server-side Upload Error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}

