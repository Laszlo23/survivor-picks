import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getActiveSeason } from "@/lib/actions/episodes";
import { getLeaderboard } from "@/lib/actions/leaderboard";
import { getCommunityLeaderboard } from "@/lib/actions/referral";
import { LeaderboardClient } from "./leaderboard-client";
import { EmptyState } from "@/components/ui/empty-state";
import { Trophy } from "lucide-react";

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string };
}) {
  const session = await getSession();
  if (!session?.user) redirect("/auth/signin");

  const season = await getActiveSeason();
  if (!season) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16">
        <EmptyState
          icon={Trophy}
          title="No Active Season"
          description="Leaderboard will appear when a season is active."
        />
      </div>
    );
  }

  const page = Number(searchParams.page) || 1;
  const search = searchParams.search || "";

  const [data, communityData] = await Promise.all([
    getLeaderboard({
      seasonId: season.id,
      page,
      limit: 20,
      search,
    }),
    getCommunityLeaderboard(season.id, 20),
  ]);

  return (
    <LeaderboardClient
      data={data}
      seasonTitle={season.title}
      currentUserId={session.user.id}
      search={search}
      tribes={season.tribes}
      communityData={communityData}
    />
  );
}
