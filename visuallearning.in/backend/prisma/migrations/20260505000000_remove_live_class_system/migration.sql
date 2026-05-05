-- Remove the live-class/teacher system.
UPDATE "User" SET "role" = 'STUDENT' WHERE "role" = 'TEACHER';

DROP TABLE IF EXISTS "LiveClassAccess";
DROP TABLE IF EXISTS "LiveClass";
DROP TABLE IF EXISTS "StudentGroupMember";
DROP TABLE IF EXISTS "StudentGroup";

ALTER TYPE "Role" RENAME TO "Role_old";
CREATE TYPE "Role" AS ENUM ('STUDENT', 'ADMIN');
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role" USING "role"::text::"Role";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'STUDENT';
DROP TYPE "Role_old";

DROP TYPE IF EXISTS "LiveClassStatus";
DROP TYPE IF EXISTS "NotificationTarget";
