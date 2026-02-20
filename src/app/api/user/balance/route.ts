import { getSession } from "@/lib/auth";
import { getBalance } from "@/lib/actions/token-balance";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session?.user?.id) {
    return Response.json({ balance: "0" }, { status: 401 });
  }

  const balance = await getBalance(session.user.id);
  return Response.json({ balance: balance.toString() });
}
