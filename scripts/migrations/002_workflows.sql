-- Create Workflows table
CREATE TABLE IF NOT EXISTS "workflows" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" varchar NOT NULL,
    "description" varchar,
    "isActive" boolean DEFAULT true,
    "trigger" varchar NOT NULL,
    "conditions" jsonb,
    "actions" jsonb NOT NULL,
    "priority" integer,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for trigger
CREATE INDEX IF NOT EXISTS "idx_workflows_trigger" ON "workflows" ("trigger");
CREATE INDEX IF NOT EXISTS "idx_workflows_isActive" ON "workflows" ("isActive");
