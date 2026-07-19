import { Resend } from "resend";
import { requireEnv } from "../lib/env.js";

export const resend = new Resend(requireEnv("RESEND_API_KEY"));
