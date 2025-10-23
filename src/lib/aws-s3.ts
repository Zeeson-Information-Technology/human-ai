export async function s3(region = process.env.AWS_REGION || "us-east-1") {
  const { S3Client } = await import("@aws-sdk/client-s3");
  return new S3Client({ region });
}

export async function s3PresignGet(bucket: string, key: string, expiresIn = 300) {
  const client = await s3();
  const { GetObjectCommand } = await import("@aws-sdk/client-s3");
  const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");
  const cmd = new GetObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(client, cmd, { expiresIn });
}

