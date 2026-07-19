import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";
import { requireEnv } from "./src/lib/env.js";

config({ path: ".env" });

export default defineConfig({
	schema: "./src/db/schema/index.ts",
	out: "./drizzle",
	dialect: "postgresql",
	dbCredentials: {
		url: requireEnv("DATABASE_URL"),
	},
});
