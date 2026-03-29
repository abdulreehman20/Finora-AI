import { usernameClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { stripeClient } from "@better-auth/stripe/client";

const appURL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:7000";

export const authClient = createAuthClient({
  // Route auth requests through Next.js /api/auth proxy.
  // This keeps auth requests same-origin for cookie reliability.
  baseURL: appURL,
  plugins: [
    usernameClient(),
    // Official Better Auth Stripe client plugin — enables authClient.subscription.*
    stripeClient({
      subscription: true, // enable subscription management
    }),
  ],
});
