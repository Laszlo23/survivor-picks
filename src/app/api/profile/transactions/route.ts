import { NextRequest } from "next/server";
import { getTransactionHistory } from "@/lib/actions/profile";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const filter = url.searchParams.get("filter") || undefined;
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 50);
  const offset = parseInt(url.searchParams.get("offset") || "0");

  const result = await getTransactionHistory(limit, offset, filter === "all" ? undefined : filter);
  return Response.json(result);
}
