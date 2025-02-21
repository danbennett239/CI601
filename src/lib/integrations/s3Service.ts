import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.AWS_REGION as string,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME as string;
const UPLOAD_FOLDER = "uploads/";

/**
 * Generates a pre-signed URL for uploading an image.
 * @param filename - The name of the file (e.g., "profile.jpg").
 * @param filetype - The MIME type (e.g., "image/png").
 * @returns The pre-signed upload URL and the public file URL.
 */
export async function generatePresignedUploadUrl(
  filename: string,
  filetype: string
): Promise<{ uploadUrl: string; fileUrl: string }> {
  // Create a unique key for the file (prefix + timestamp + original filename)
  const key = `${UPLOAD_FOLDER}${Date.now()}-${filename}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: filetype,
  });

  // The signed URL expires in 60 seconds
  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 });

  // The S3 public URL (assuming your bucket is public or has the right policy)
  const fileUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

  return {
    uploadUrl,
    fileUrl,
  };
}

/**
 * Generates a pre-signed URL for fetching (downloading) an image.
 * @param key - The S3 object key (e.g., "uploads/profile.jpg").
 * @returns The pre-signed URL for accessing the image.
 */
export async function generatePresignedDownloadUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  // The signed URL expires in 3600 seconds (1 hour)
  return getSignedUrl(s3, command, { expiresIn: 3600 });
}

export async function uploadFileBuffer(
  fileBuffer: Buffer,
  fileName: string,
  fileType: string
): Promise<string> {
  // Generate a unique key (uploads/ + timestamp + original filename)
  const key = `${UPLOAD_FOLDER}${Date.now()}-${fileName}`;

  // Perform the actual PUT to S3
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: fileType,
    })
  );

  const fileUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  return fileUrl;
}

export async function deleteFileFromS3(key: string): Promise<void> {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })
  );
}