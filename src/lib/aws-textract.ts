export async function textract(region = process.env.AWS_REGION || "us-east-1") {
  const { TextractClient } = await import("@aws-sdk/client-textract");
  return new TextractClient({ region });
}

