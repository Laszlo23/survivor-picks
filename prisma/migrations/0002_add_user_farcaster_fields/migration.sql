-- AlterTable: Add onboarding flag and Farcaster Mini App fields to User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "hasOnboarded" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "farcasterFid" INTEGER;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "farcasterUsername" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "fcNotificationToken" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "fcNotificationUrl" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "User_farcasterFid_key" ON "User"("farcasterFid");
