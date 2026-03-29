import cors from "cors";
import express from "express";
import router from "./routes";
import { auth } from "./lib/auth";
import { initializeCrons } from "./cron";
import docsRouter from "./routes/docs.route";
import { toNodeHandler } from "better-auth/node";
import { errorHandler } from "./middlewares/error.middleware";
import { attachUserFromSession } from "./middlewares/auth.middleware";

const app = express();
const PORT = 7000;

app.use(
  cors({
    origin: process.env.NEXT_PUBLIC_APP_URL, // React app URL
    methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed HTTP methods
    credentials: true, // allow cookies
  }),
);

app.use(express.json());

app.all("/api/auth/*splat", toNodeHandler(auth));

// Mount express json middleware after Better Auth handler

app.use(express.urlencoded({ extended: true }));

// Attach Better Auth user to req.user for all subsequent routes
app.use(attachUserFromSession);

app.use("/api", router);                                                                                  // -----> All API routes are prefixed with /api
app.use("/api/docs", docsRouter);                                                                        // -----> API documentation route
app.get("/", (_req, res) => { res.json({ message: "Welcome to Finora Finance AI SaaS API!" }) });       // -----> Home Api for welcoming
app.get("/api/health", (_req, res) => { res.json({ message: "API is working!" }) });                   // -----> Api Health check route

// Error handling middleware (should be last)
app.use(errorHandler);

app.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  // if (process.env.NODE_ENV === "development") {
  //   await initializeCrons();
  // }
});











// // ✅ Trust proxy - REQUIRED for Better Auth to detect client IPs behind reverse proxy
// app.set("trust proxy", true);

// // ✅ CORS configuration
// app.use(
//   cors({
//     origin: [
//       process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
//       process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:7000",
//     ],
//     methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
//     credentials: true,
//     allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
//   }),
// );

// // ✅ CRITICAL: Raw body for Stripe webhooks must come BEFORE Better Auth handler
// // Stripe needs the raw body to verify signatures
// app.use(
//   "/api/auth/stripe/webhook",
//   express.raw({ type: "application/json" })
// );

// // ✅ Mount Better Auth handler
// // This handles all /api/auth/* routes including Stripe webhooks
// // app.all("/api/auth/*splat", toNodeHandler(auth));
// app.all("/api/auth/*splat", (req, res, next) => {
//   console.log("Request IP:", req.ip);
//   console.log("Headers:", req.headers);
//   console.log("X-Forwarded-For:", req.headers["x-forwarded-for"]);
//   next();
// }, toNodeHandler(auth));

// // ✅ Regular JSON parsing for all other routes (AFTER Better Auth)
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // ✅ Attach Better Auth user to req.user for all subsequent routes
// app.use(attachUserFromSession);

// // ✅ Your API routes
// app.use("/api", router);
// app.use("/api/docs", docsRouter);

// // ✅ Health check routes
// app.get("/", (_req, res) => {
//   res.json({ message: "Welcome to Finora Finance AI SaaS API!" });
// });

// app.get("/api/health", (_req, res) => {
//   res.json({ message: "API is working!" });
// });

// // ✅ Error handling middleware (must be last)
// app.use(errorHandler);

// app.listen(PORT, "0.0.0.0", () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
//   console.log(`Better Auth endpoints: http://localhost:${PORT}/api/auth`);
// });


