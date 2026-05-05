CREATE TABLE IF NOT EXISTS "SubscriptionPlan" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "price" INTEGER NOT NULL DEFAULT 0,
  "durationDays" INTEGER NOT NULL DEFAULT 30,
  "features" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "displayOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SubscriptionPlan_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "PlanCourse" (
  "planId" TEXT NOT NULL,
  "courseId" TEXT NOT NULL,
  CONSTRAINT "PlanCourse_pkey" PRIMARY KEY ("planId","courseId")
);

CREATE UNIQUE INDEX IF NOT EXISTS "SubscriptionPlan_code_key" ON "SubscriptionPlan"("code");
CREATE INDEX IF NOT EXISTS "SubscriptionPlan_code_idx" ON "SubscriptionPlan"("code");
CREATE INDEX IF NOT EXISTS "SubscriptionPlan_isActive_idx" ON "SubscriptionPlan"("isActive");
CREATE INDEX IF NOT EXISTS "PlanCourse_courseId_idx" ON "PlanCourse"("courseId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'PlanCourse_planId_fkey'
  ) THEN
    ALTER TABLE "PlanCourse" ADD CONSTRAINT "PlanCourse_planId_fkey"
    FOREIGN KEY ("planId") REFERENCES "SubscriptionPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'PlanCourse_courseId_fkey'
  ) THEN
    ALTER TABLE "PlanCourse" ADD CONSTRAINT "PlanCourse_courseId_fkey"
    FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
