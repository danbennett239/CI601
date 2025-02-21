import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

// Initialize the S3 client with credentials from environment variables.
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
 * Uploads a file buffer to S3 and returns the public file URL.
 * - Generates a unique filename using a timestamp to prevent overwriting.
 * - Uses `PutObjectCommand` to store the file in the specified S3 bucket.
 * 
 * @param fileBuffer - The file data as a Buffer.
 * @param fileName - The original filename.
 * @param fileType - The MIME type of the file.
 * @returns The publicly accessible URL of the uploaded file.
 */
export async function uploadFileBuffer(
  fileBuffer: Buffer,
  fileName: string,
  fileType: string
): Promise<string> {
  const key = `${UPLOAD_FOLDER}${Date.now()}-${fileName}`;
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

/**
 * Deletes a file from S3.
 * - Uses `DeleteObjectCommand` to remove the file from the bucket.
 * 
 * @param key - The S3 object key (e.g., "uploads/myFile.png").
 */
export async function deleteFileFromS3(key: string): Promise<void> {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })
  );
}

/**
 * Extracts the S3 object key from a full public URL.
 * - Assumes the URL follows the format: `https://bucket.s3.region.amazonaws.com/uploads/file.png`
 * - Uses regex to capture everything after `.com/`.
 * 
 * @param url - The full S3 public URL.
 * @returns The extracted object key or null if extraction fails.
 */
export function extractKeyFromS3Url(url: string): string | null {
  try {
    const match = url.match(/\.com\/(.+)$/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}