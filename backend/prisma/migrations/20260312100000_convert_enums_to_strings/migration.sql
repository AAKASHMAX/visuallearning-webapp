-- Convert Video.language from Language enum to TEXT
ALTER TABLE "Video" ALTER COLUMN "language" SET DATA TYPE TEXT USING "language"::TEXT;
ALTER TABLE "Video" ALTER COLUMN "language" SET DEFAULT 'ENGLISH';

-- Convert Subscription.plan from PlanType enum to TEXT
ALTER TABLE "Subscription" ALTER COLUMN "plan" SET DATA TYPE TEXT USING "plan"::TEXT;

-- Drop the now-unused enums
DROP TYPE IF EXISTS "Language";
DROP TYPE IF EXISTS "PlanType";
