export async function comprehend(region = process.env.AWS_REGION || "us-east-1") {
  const { ComprehendClient } = await import("@aws-sdk/client-comprehend");
  return new ComprehendClient({ region });
}

