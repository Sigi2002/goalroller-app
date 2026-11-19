CREATE TABLE "goalroller_activations" (
	"member_id" text PRIMARY KEY NOT NULL,
	"first_rolled_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "goalroller_activations" ADD CONSTRAINT "goalroller_activations_member_id_users_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;