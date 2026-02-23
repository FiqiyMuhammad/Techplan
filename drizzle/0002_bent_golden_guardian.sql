CREATE TABLE "todos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" text NOT NULL,
	"task" text NOT NULL,
	"isCompleted" boolean DEFAULT false,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "user" DROP CONSTRAINT "user_username_unique";--> statement-breakpoint
DROP INDEX "user_username_idx";--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "emailVerified" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "createdAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "updatedAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "updatedAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "scripts" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "updatedAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "role" text DEFAULT 'USER';--> statement-breakpoint
ALTER TABLE "verification" ADD COLUMN "createdAt" timestamp;--> statement-breakpoint
ALTER TABLE "verification" ADD COLUMN "updatedAt" timestamp;--> statement-breakpoint
ALTER TABLE "todos" ADD CONSTRAINT "todos_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "todo_user_idx" ON "todos" USING btree ("userId");--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "username";--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_token_unique" UNIQUE("token");