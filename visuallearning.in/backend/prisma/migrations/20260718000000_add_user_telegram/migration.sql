-- Link a user to their Telegram chat (set when they press Start on the bot).
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "telegramChatId" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "User_telegramChatId_key" ON "User"("telegramChatId");
