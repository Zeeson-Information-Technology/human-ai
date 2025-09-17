// src/lib/db.ts
import "server-only";
import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI!;
const dbName = process.env.MONGODB_DB || "human_intel";

if (!uri) throw new Error("MONGODB_URI is not set");

let client: MongoClient;
let db: Db;

declare global {
  // eslint-disable-next-line no-var
  var __mongo: { client: MongoClient; db: Db } | undefined;
}

export async function getDb() {
  if (!global.__mongo) {
    client = new MongoClient(uri);
    await client.connect();
    db = client.db(dbName);
    global.__mongo = { client, db };
  }
  return global.__mongo.db;
}
