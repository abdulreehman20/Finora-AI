import cors from "cors";
import express from "express";
import { toNodeHandler } from "better-auth/node";
import { serve } from "inngest/express";

import { auth } from "./lib/auth.js";
import { functions, inngest } from "./inngest/index.js";
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
  process.env.FRONTEND_URL,
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

// 4. Inngest serve endpoint (must be after JSON middleware)
app.use(
  "/api/inngest",
  serve({
    client: inngest,
    functions,
  }),
);

// 5. Attach user from session (after body parsing)
app.use(attachUserFromSession);

// 6. Your other middleware
app.use(requestLogger);

// 7. Your routes
app.get("/", (_req, res) => {
  res.json({ message: "Welcome to Finora Finance AI SaaS API!" });
});

app.get("/api/health", (_req, res) => {
  res.json({ message: "API is working!" });
});

/** Manual smoke-test route — sends `test/hello.world` to the local Inngest Dev Server. */
app.get("/api/hello", async (_req, res, next) => {
  try {
    await inngest.send({
      name: "test/hello.world",
      data: { email: "finora@example.com" },
    });
    res.json({ message: "Event sent!" });
  } catch (err) {
    next(err);
  }
});

app.use("/api", router); // -----> API routes
app.use("/api/docs", docsRouter); // -----> API documentation route

// 8. Error handler last
app.use(errorHandler);

export default app;
