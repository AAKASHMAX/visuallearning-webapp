-- Add optional mobile number to users (collected at signup).
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phone" TEXT;
