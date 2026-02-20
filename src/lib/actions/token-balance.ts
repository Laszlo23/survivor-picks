"use server";

import { prisma } from "@/lib/prisma";

const SIGNUP_BONUS = BigInt(33_333);

export async function creditSignupBonus(userId: string) {
  const existing = await prisma.tokenTransaction.findFirst({
    where: { userId, type: "signup_bonus" },
  });

  if (existing) return;

  await prisma.tokenTransaction.create({
    data: {
      userId,
      amount: SIGNUP_BONUS,
      type: "signup_bonus",
      note: "Welcome bonus — 33,333 $PICKS",
    },
  });
}

export async function getBalance(userId: string): Promise<bigint> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { picksBalance: true },
  });
  return user?.picksBalance ?? BigInt(0);
}

export async function getTransactions(userId: string, limit = 20) {
  return prisma.tokenTransaction.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function debitBalance(
  userId: string,
  amount: bigint,
  type: string,
  note?: string
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { picksBalance: true },
  });

  if (!user || user.picksBalance < amount) {
    throw new Error("Insufficient balance");
  }

  const [, tx] = await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { picksBalance: { decrement: amount } },
    }),
    prisma.tokenTransaction.create({
      data: {
        userId,
        amount: -amount,
        type,
        note,
      },
    }),
  ]);

  return tx;
}

export async function creditBalance(
  userId: string,
  amount: bigint,
  type: string,
  note?: string
) {
  const [, tx] = await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { picksBalance: { increment: amount } },
    }),
    prisma.tokenTransaction.create({
      data: {
        userId,
        amount,
        type,
        note,
      },
    }),
  ]);

  return tx;
}
