import { usernameClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { stripeClient } from "@better-auth/stripe/client";

const rawBackendURL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:7000";

// Trim any trailing slash. A trailing slash on the baseURL produces
// requests like `https://api.example.com//api/auth/...` which can fail
// or produce inconsistent CORS behavior.
const appURL = rawBackendURL.replace(/\/+$/, "");

export const authClient = createAuthClient({
  baseURL: appURL,
  plugins: [
    usernameClient(),
    // Official Better Auth Stripe client plugin — enables authClient.subscription.*
    stripeClient({
      subscription: true, // enable subscription management
    }),
  ],
});
