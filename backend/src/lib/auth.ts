import { stripe } from "@better-auth/stripe";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { openAPI, username } from "better-auth/plugins";
import { Resend } from "resend";
import Stripe from "stripe";

import { db } from "../db/db.js";
import {
	account,
	session,
	subscription,
	user,
	verification,
} from "../db/schema/index.js";
import { seedDefaultCategoriesService } from "../services/categories.service.js";
import {
	deleteAccountEmailTemplate,
	passwordResetSuccessTemplate,
	resetPasswordEmailTemplate,
	verifyEmailTemplate,
} from "../mailers/templates/reset.password.js";
import { optionalEnv, requireEnv } from "./env.js";

const resend = new Resend(requireEnv("RESEND_API_KEY"));
const appName = optionalEnv("BETTER_AUTH_APP_NAME", "Finora AI");
const mailerSender = requireEnv("MAILER_SENDER");

const stripeClient = new Stripe(requireEnv("STRIPE_SECRET_KEY"), {
	apiVersion: "2026-02-25.clover",
});

const schema = {
	user,
	session,
	account,
	verification,
	subscription,
};

export const auth = betterAuth({
	secret: requireEnv("BETTER_AUTH_SECRET"),
	appName,
	baseURL: optionalEnv("NEXT_PUBLIC_BACKEND_URL", "http://localhost:7000"),

	trustedOrigins: [
		"http://localhost:3000",
		optionalEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000"),
		optionalEnv("NEXT_PUBLIC_BACKEND_URL", "http://localhost:7000"),
		"https://finora-ai-backend.vercel.app",
	],

	database: drizzleAdapter(db, { provider: "pg", schema }),

	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
		sendResetPassword: async ({ user, url }, _request) => {
			await resend.emails.send({
				from: mailerSender,
				to: user.email,
				subject: "Reset your password",
				html: resetPasswordEmailTemplate(url),
			});
		},
		onPasswordReset: async ({ user }, _request) => {
			await resend.emails.send({
				from: mailerSender,
				to: user.email,
				subject: "Password reset successfully",
				html: passwordResetSuccessTemplate(),
			});
		},
	},

	user: {
		changeEmail: { enabled: true, updateEmailWithoutVerification: false },
		deleteUser: {
			enabled: true,
			sendDeleteAccountVerification: async ({ user, url }, _request) => {
				await resend.emails.send({
					from: mailerSender,
					to: user.email,
					subject: "Confirm account deletion",
					html: deleteAccountEmailTemplate(url),
				});
			},
		},
	},

	rateLimit: { enabled: true, window: 60, max: 120 },

	plugins: [
		username(),
		openAPI(),
		stripe({
			stripeClient,
			stripeWebhookSecret: requireEnv("STRIPE_WEBHOOK_SECRET"),
			createCustomerOnSignUp: true,
			subscription: {
				enabled: true,
				plans: [
					{
						name: "pro",
						priceId: requireEnv("STRIPE_PRO_PRICE_ID"),
					},
				],
			},
		}),
	],

	emailVerification: {
		sendVerificationEmail: async ({ user, url }, _request) => {
			await resend.emails.send({
				from: mailerSender,
				to: user.email,
				subject: "Verify your email address",
				html: verifyEmailTemplate(url),
			});
		},
	},

	databaseHooks: {
		user: {
			create: {
				after: async (createdUser) => {
					await seedDefaultCategoriesService(createdUser.id);
				},
			},
		},
	},

	// advanced: { disableOriginCheck: true },
});
