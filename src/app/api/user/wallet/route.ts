import { getSession } from "@/lib/auth";
import { getBalance, getTransactions } from "@/lib/actions/token-balance";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [balance, transactions] = await Promise.all([
    getBalance(session.user.id),
    getTransactions(session.user.id, 20),
  ]);

  return Response.json({
    balance: balance.toString(),
    transactions: transactions.map((tx) => ({
      id: tx.id,
      amount: tx.amount.toString(),
      type: tx.type,
      note: tx.note,
      createdAt: tx.createdAt.toISOString(),
    })),
  });
}
