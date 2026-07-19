import cors from "cors";
import express from "express";
import { toNodeHandler } from "better-auth/node";

import { auth } from "./lib/auth.js";
import { attachUserFromSession } from "./middlewares/auth.middleware.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { requestLogger } from "./middlewares/request-logger.middleware.js";
import router from "./routes/index.js";
import docsRouter from "./routes/docs.route.js";

const app = express();

// 1. CORS first
const allowedOrigins = [
  "http://localhost:3000",
  process.env.NEXT_PUBLIC_APP_URL,
].filter(Boolean) as string[];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  }),
);

// 2. BETTER AUTH HANDLER - BEFORE express.json()!
app.all("/api/auth/*splat", toNodeHandler(auth));

// 3. JSON middleware ONLY AFTER Better Auth handler
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. Attach user from session (after body parsing)
app.use(attachUserFromSession);

// 5. Your other middleware
app.use(requestLogger);

// 6. Your routes
app.get("/", (_req, res) => {
  res.json({ message: "Welcome to Finora Finance AI SaaS API!" });
});

app.get("/api/health", (_req, res) => {
  res.json({ message: "API is working!" });
});

app.use("/api", router); // -----> API routes
app.use("/api/docs", docsRouter); // -----> API documentation route

// 7. Error handler last
app.use(errorHandler);

export default app;
