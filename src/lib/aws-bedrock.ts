export async function bedrockRuntime(region = process.env.AWS_REGION || "us-east-1") {
  const { BedrockRuntimeClient } = await import("@aws-sdk/client-bedrock-runtime");
  return new BedrockRuntimeClient({ region });
}

