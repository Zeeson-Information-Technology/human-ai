export async function chimeMeetings(region = process.env.CHIME_REGION || process.env.AWS_REGION || "us-east-1") {
  const { ChimeSDKMeetingsClient } = await import("@aws-sdk/client-chime-sdk-meetings");
  return new ChimeSDKMeetingsClient({ region });
}

