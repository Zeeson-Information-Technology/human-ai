// src/lib/db-connect.ts
import "server-only";
import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "human_intel";
if (!uri) throw new Error("MONGODB_URI is not set");

declare global {
  // eslint-disable-next-line no-var
  var __mongoose: Promise<typeof mongoose> | undefined;
}

export default async function dbConnect() {
  if (!global.__mongoose) {
    global.__mongoose = mongoose.connect(uri, { dbName });
  }
  return global.__mongoose;
}
