CREATE TYPE "public"."budget_period" AS ENUM('WEEKLY', 'MONTHLY');--> statement-breakpoint
CREATE TABLE "budget" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"category_id" text NOT NULL,
	"amount" integer NOT NULL,
	"period" "budget_period" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "budget" ADD CONSTRAINT "budget_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget" ADD CONSTRAINT "budget_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "budget_user_id_idx" ON "budget" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "budget_category_id_uidx" ON "budget" USING btree ("category_id");--> statement-breakpoint
CREATE UNIQUE INDEX "budget_user_id_category_id_uidx" ON "budget" USING btree ("user_id","category_id");
