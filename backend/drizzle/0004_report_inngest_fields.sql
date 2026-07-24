ALTER TYPE "public"."report_frequency" ADD VALUE IF NOT EXISTS 'WEEKLY';--> statement-breakpoint
ALTER TABLE "report_setting" ADD COLUMN IF NOT EXISTS "email" text;--> statement-breakpoint
ALTER TABLE "report" ADD COLUMN IF NOT EXISTS "email_content" text;
