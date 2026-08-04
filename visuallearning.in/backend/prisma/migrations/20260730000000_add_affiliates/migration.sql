-- Affiliate program: affiliates (linked to a user, with a coupon code + commission)
-- and a per-sale commission ledger. Idempotent so it can be applied to prod safely.

DO $$ BEGIN
  CREATE TYPE "AffiliateStatus" AS ENUM ('PENDING', 'APPROVED', 'BLOCKED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS "Affiliate" (
  "id"                TEXT NOT NULL,
  "userId"            TEXT NOT NULL,
  "code"              TEXT NOT NULL,
  "commissionPercent" INTEGER,
  "status"            "AffiliateStatus" NOT NULL DEFAULT 'PENDING',
  "payoutMethod"      TEXT,
  "payoutDetails"     TEXT,
  "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Affiliate_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Affiliate_userId_key" ON "Affiliate"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "Affiliate_code_key" ON "Affiliate"("code");
CREATE INDEX IF NOT EXISTS "Affiliate_status_idx" ON "Affiliate"("status");

CREATE TABLE IF NOT EXISTS "AffiliateCommission" (
  "id"               TEXT NOT NULL,
  "affiliateId"      TEXT NOT NULL,
  "subscriptionId"   TEXT NOT NULL,
  "userId"           TEXT NOT NULL,
  "saleAmount"       INTEGER NOT NULL,
  "commissionAmount" INTEGER NOT NULL,
  "status"           TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "paidAt"           TIMESTAMP(3),
  CONSTRAINT "AffiliateCommission_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "AffiliateCommission_subscriptionId_key" ON "AffiliateCommission"("subscriptionId");
CREATE INDEX IF NOT EXISTS "AffiliateCommission_affiliateId_idx" ON "AffiliateCommission"("affiliateId");
CREATE INDEX IF NOT EXISTS "AffiliateCommission_status_idx" ON "AffiliateCommission"("status");

DO $$ BEGIN
  ALTER TABLE "Affiliate" ADD CONSTRAINT "Affiliate_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "AffiliateCommission" ADD CONSTRAINT "AffiliateCommission_affiliateId_fkey"
    FOREIGN KEY ("affiliateId") REFERENCES "Affiliate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;
