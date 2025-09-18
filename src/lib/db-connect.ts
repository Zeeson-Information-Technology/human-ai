// /src/lib/db-connect.ts
import "server-only";
import mongoose from "mongoose";

function getMongoUri(): string {
  const u = process.env.MONGODB_URI;
  if (!u) throw new Error("MONGODB_URI is not set");
  return u;
}

const dbName = process.env.MONGODB_DB || "human_intel";

declare global {
  // eslint-disable-next-line no-var
  var __mongoose: Promise<typeof mongoose> | undefined;
}

export default async function dbConnect() {
  if (!global.__mongoose) {
    // getMongoUri() returns a string, so TS is happy
    global.__mongoose = mongoose.connect(getMongoUri(), { dbName });
  }
  return global.__mongoose;
}
