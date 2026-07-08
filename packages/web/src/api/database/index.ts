import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

// Force HTTP transport instead of the default WebSocket. The persistent
// WebSocket pipe to Turso drops with ECONNRESET on idle, breaking queries.
// Plain HTTP makes every request independent and reliable.
const rawUrl = process.env.DATABASE_URL!;
const httpUrl = rawUrl
  .replace(/^libsql:\/\//, "https://")
  .replace(/^ws:\/\//, "http://")
  .replace(/^wss:\/\//, "https://");

const client = createClient({
  url: httpUrl,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });
