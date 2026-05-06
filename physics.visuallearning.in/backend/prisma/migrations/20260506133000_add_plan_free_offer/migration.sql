ALTER TABLE "SubscriptionPlan" ADD COLUMN IF NOT EXISTS "freeOfferEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "SubscriptionPlan" ADD COLUMN IF NOT EXISTS "freeOfferUntil" TIMESTAMP(3);
ALTER TABLE "Course" ALTER COLUMN "tier" SET DEFAULT 'BASIC';

UPDATE "SubscriptionPlan"
SET "isActive" = false
WHERE "code" = 'FREE';

UPDATE "Course"
SET "isActive" = false
WHERE "tier" = 'FREE';

UPDATE "SubscriptionPlan" SET "displayOrder" = 1 WHERE "code" IN ('BRIDGE', 'BRIDGE_YEARLY');
UPDATE "SubscriptionPlan" SET "displayOrder" = 2 WHERE "code" IN ('BASIC', 'BASIC_YEARLY');
UPDATE "SubscriptionPlan" SET "displayOrder" = 3 WHERE "code" IN ('ADVANCE', 'ADVANCE_YEARLY');
