-- CreateTable
CREATE TABLE "EmailPicksClaim" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "claimedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailPicksClaim_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmailPicksClaim_email_key" ON "EmailPicksClaim"("email");

-- CreateIndex
CREATE INDEX "EmailPicksClaim_email_idx" ON "EmailPicksClaim"("email");
