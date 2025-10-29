// Lightweight creators for AWS SDK v3 clients. Install deps listed in docs.

export async function bedrockRuntime(
  region = process.env.AWS_REGION || "us-east-1"
) {
  const { BedrockRuntimeClient } = await import(
    "@aws-sdk/client-bedrock-runtime"
  );
  return new BedrockRuntimeClient({ region });
}

export async function polly(region = process.env.AWS_REGION || "us-east-1") {
  const { PollyClient } = await import("@aws-sdk/client-polly");
  return new PollyClient({ region });
}

export async function chimeMeetings(
  region = process.env.CHIME_REGION || process.env.AWS_REGION || "us-east-1"
) {
  const { ChimeSDKMeetingsClient } = await import(
    "@aws-sdk/client-chime-sdk-meetings"
  );
  return new ChimeSDKMeetingsClient({ region });
}

export async function s3(region = process.env.AWS_REGION || "us-east-1") {
  const { S3Client } = await import("@aws-sdk/client-s3");
  return new S3Client({ region });
}

export async function rekognition(
  region = process.env.AWS_REGION || "us-east-1"
) {
  const { RekognitionClient } = await import("@aws-sdk/client-rekognition");
  return new RekognitionClient({ region });
}

export async function textract(region = process.env.AWS_REGION || "us-east-1") {
  const dynImport = (m: string) =>
    (
      Function("return import(m)") as unknown as (x: string) => Promise<unknown>
    )(m);
  try {
    const mod = (await dynImport("@aws-sdk/client-textract")) as {
      TextractClient: new (cfg: { region: string }) => any;
    };
    return new mod.TextractClient({ region });
  } catch {
    throw new Error(
      "@aws-sdk/client-textract not installed. Install it or disable Textract features."
    );
  }
}

export async function comprehend(
  region = process.env.AWS_REGION || "us-east-1"
) {
  const { ComprehendClient } = await import("@aws-sdk/client-comprehend");
  return new ComprehendClient({ region });
}

export async function s3PresignGet(
  bucket: string,
  key: string,
  expiresIn = 300
) {
  const client = await s3();
  const { GetObjectCommand } = await import("@aws-sdk/client-s3");
  const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");
  const cmd = new GetObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(client, cmd, { expiresIn });
}
