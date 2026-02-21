-- Add missing columns to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "picksBalance" BIGINT NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "supabaseAuthId" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "hasOnboarded" BOOLEAN NOT NULL DEFAULT false;

-- Add unique constraint for supabaseAuthId
CREATE UNIQUE INDEX IF NOT EXISTS "User_supabaseAuthId_key" ON "User"("supabaseAuthId");

-- Add missing columns to Prediction table
ALTER TABLE "Prediction" ADD COLUMN IF NOT EXISTS "stakeAmount" TEXT;
ALTER TABLE "Prediction" ADD COLUMN IF NOT EXISTS "txHash" TEXT;

-- Add Newsletter subscription table if not exists
CREATE TABLE IF NOT EXISTS "NewsletterSubscription" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsletterSubscription_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "NewsletterSubscription_email_key" ON "NewsletterSubscription"("email");

-- Add TokenTransaction table if not exists
CREATE TABLE IF NOT EXISTS "TokenTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "type" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TokenTransaction_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "TokenTransaction_userId_idx" ON "TokenTransaction"("userId");
ALTER TABLE "TokenTransaction" DROP CONSTRAINT IF EXISTS "TokenTransaction_userId_fkey";
ALTER TABLE "TokenTransaction" ADD CONSTRAINT "TokenTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add SocialTaskClaim seasonId FK if missing
ALTER TABLE "SocialTaskClaim" DROP CONSTRAINT IF EXISTS "SocialTaskClaim_seasonId_fkey";
ALTER TABLE "SocialTaskClaim" ADD CONSTRAINT "SocialTaskClaim_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add LiveSession table
CREATE TABLE IF NOT EXISTS "LiveSession" (
    "id" TEXT NOT NULL,
    "episodeId" TEXT NOT NULL,
    "streamUrl" TEXT NOT NULL,
    "streamType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "viewerCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LiveSession_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "LiveSession_episodeId_idx" ON "LiveSession"("episodeId");
CREATE INDEX IF NOT EXISTS "LiveSession_status_idx" ON "LiveSession"("status");
ALTER TABLE "LiveSession" DROP CONSTRAINT IF EXISTS "LiveSession_episodeId_fkey";
ALTER TABLE "LiveSession" ADD CONSTRAINT "LiveSession_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add LiveBet table
CREATE TABLE IF NOT EXISTS "LiveBet" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "odds" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "correctOption" TEXT,
    "opensAt" TIMESTAMP(3) NOT NULL,
    "locksAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),
    "aiConfidence" DOUBLE PRECISION,
    "multiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "totalPool" TEXT NOT NULL DEFAULT '0',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LiveBet_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "LiveBet_sessionId_idx" ON "LiveBet"("sessionId");
CREATE INDEX IF NOT EXISTS "LiveBet_status_idx" ON "LiveBet"("status");
CREATE INDEX IF NOT EXISTS "LiveBet_locksAt_idx" ON "LiveBet"("locksAt");
ALTER TABLE "LiveBet" DROP CONSTRAINT IF EXISTS "LiveBet_sessionId_fkey";
ALTER TABLE "LiveBet" ADD CONSTRAINT "LiveBet_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "LiveSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add LiveBetPlacement table
CREATE TABLE IF NOT EXISTS "LiveBetPlacement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "liveBetId" TEXT NOT NULL,
    "chosenOption" TEXT NOT NULL,
    "stakeAmount" TEXT NOT NULL DEFAULT '0',
    "txHash" TEXT,
    "payout" TEXT,
    "isCorrect" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LiveBetPlacement_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "LiveBetPlacement_userId_idx" ON "LiveBetPlacement"("userId");
CREATE INDEX IF NOT EXISTS "LiveBetPlacement_liveBetId_idx" ON "LiveBetPlacement"("liveBetId");
CREATE UNIQUE INDEX IF NOT EXISTS "LiveBetPlacement_userId_liveBetId_key" ON "LiveBetPlacement"("userId", "liveBetId");
ALTER TABLE "LiveBetPlacement" DROP CONSTRAINT IF EXISTS "LiveBetPlacement_userId_fkey";
ALTER TABLE "LiveBetPlacement" ADD CONSTRAINT "LiveBetPlacement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LiveBetPlacement" DROP CONSTRAINT IF EXISTS "LiveBetPlacement_liveBetId_fkey";
ALTER TABLE "LiveBetPlacement" ADD CONSTRAINT "LiveBetPlacement_liveBetId_fkey" FOREIGN KEY ("liveBetId") REFERENCES "LiveBet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add AIFrame table
CREATE TABLE IF NOT EXISTS "AIFrame" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "frameUrl" TEXT,
    "analysis" JSONB NOT NULL,
    "events" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIFrame_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "AIFrame_sessionId_idx" ON "AIFrame"("sessionId");
CREATE INDEX IF NOT EXISTS "AIFrame_timestamp_idx" ON "AIFrame"("timestamp");
ALTER TABLE "AIFrame" DROP CONSTRAINT IF EXISTS "AIFrame_sessionId_fkey";
ALTER TABLE "AIFrame" ADD CONSTRAINT "AIFrame_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "LiveSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add missing FKs
ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_referredById_fkey";
ALTER TABLE "Prediction" DROP CONSTRAINT IF EXISTS "Prediction_userId_fkey";
ALTER TABLE "Prediction" ADD CONSTRAINT "Prediction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
