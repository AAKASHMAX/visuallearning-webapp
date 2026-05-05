CREATE TABLE IF NOT EXISTS "Notification" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "type" TEXT NOT NULL DEFAULT 'INFO',
  "isPublished" BOOLEAN NOT NULL DEFAULT false,
  "publishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "NotificationRead" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "notificationId" TEXT NOT NULL,
  "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "NotificationRead_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Notification_isPublished_idx" ON "Notification"("isPublished");
CREATE INDEX IF NOT EXISTS "Notification_publishedAt_idx" ON "Notification"("publishedAt");
CREATE INDEX IF NOT EXISTS "NotificationRead_userId_idx" ON "NotificationRead"("userId");
CREATE INDEX IF NOT EXISTS "NotificationRead_notificationId_idx" ON "NotificationRead"("notificationId");
CREATE UNIQUE INDEX IF NOT EXISTS "NotificationRead_userId_notificationId_key" ON "NotificationRead"("userId", "notificationId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'NotificationRead_userId_fkey'
  ) THEN
    ALTER TABLE "NotificationRead" ADD CONSTRAINT "NotificationRead_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'NotificationRead_notificationId_fkey'
  ) THEN
    ALTER TABLE "NotificationRead" ADD CONSTRAINT "NotificationRead_notificationId_fkey"
    FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
