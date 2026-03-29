import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler({
  // @ts-ignore
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:7000",
});


