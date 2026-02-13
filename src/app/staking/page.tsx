export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { StakingClient } from "./staking-client";

export default async function StakingPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin");

  return <StakingClient />;
}
