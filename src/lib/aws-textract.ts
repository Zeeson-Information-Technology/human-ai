export async function textract(region = process.env.AWS_REGION || "us-east-1") {
  // Use indirection to avoid build-time resolution; allow optional install.
  const dynImport = (m: string) => (Function("return import(m)") as unknown as (x: string) => Promise<unknown>)(m);
  try {
    const mod = (await dynImport("@aws-sdk/client-textract")) as { TextractClient: new (cfg: { region: string }) => any };
    return new mod.TextractClient({ region });
  } catch {
    throw new Error("@aws-sdk/client-textract not installed. Install it or disable Textract features.");
  }
}
