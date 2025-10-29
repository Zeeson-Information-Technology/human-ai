export async function polly(region = process.env.AWS_REGION || "us-east-1") {
  const { PollyClient } = await import("@aws-sdk/client-polly");
  return new PollyClient({ region });
}

