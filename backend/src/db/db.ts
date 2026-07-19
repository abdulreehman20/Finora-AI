import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";
import { requireEnv } from "../lib/env.js";

config({ path: ".env" }); // or .env.local

const sql = neon(requireEnv("DATABASE_URL"));
export const db = drizzle({ client: sql });
