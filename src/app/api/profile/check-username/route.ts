import { NextRequest } from "next/server";
import { checkUsername } from "@/lib/actions/profile";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { username } = await req.json();
    if (typeof username !== "string") {
      return Response.json({ available: false, reason: "Invalid input" }, { status: 400 });
    }
    const result = await checkUsername(username);
    return Response.json(result);
  } catch {
    return Response.json({ available: false, reason: "Server error" }, { status: 500 });
  }
}
