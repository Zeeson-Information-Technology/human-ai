export async function rekognition(region = process.env.AWS_REGION || "us-east-1") {
  const { RekognitionClient } = await import("@aws-sdk/client-rekognition");
  return new RekognitionClient({ region });
}

