ALTER TABLE "schedules" ADD COLUMN "color" text DEFAULT 'blue';--> statement-breakpoint
CREATE INDEX "account_user_idx" ON "account" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "credit_log_user_idx" ON "credit_logs" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "doc_user_idx" ON "documents" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "note_user_idx" ON "notes" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "schedule_user_idx" ON "schedules" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "schedule_date_idx" ON "schedules" USING btree ("date");--> statement-breakpoint
CREATE INDEX "script_user_idx" ON "scripts" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "session_user_idx" ON "session" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "sub_user_idx" ON "subscriptions" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "user_email_idx" ON "user" USING btree ("email");--> statement-breakpoint
CREATE INDEX "user_username_idx" ON "user" USING btree ("username");--> statement-breakpoint
CREATE INDEX "workflow_user_idx" ON "workflows" USING btree ("userId");