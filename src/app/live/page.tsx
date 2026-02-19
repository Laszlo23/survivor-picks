import { redirect } from "next/navigation";
import { getActiveLiveSession } from "@/lib/actions/live-sessions";
import { Tv } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function LiveLandingPage() {
  const session = await getActiveLiveSession();

  if (session) {
    redirect(`/live/${session.id}`);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="rounded-full bg-white/[0.03] p-6 mb-4">
        <Tv className="h-12 w-12 text-white/10" />
      </div>
      <h1 className="text-2xl font-headline font-bold text-white/80 mb-2">
        No Live Session
      </h1>
      <p className="text-sm text-white/30 max-w-md mb-6">
        There are no live shows right now. Come back when an episode is airing
        for real-time predictions and live betting with dynamic odds.
      </p>
      <Link
        href="/dashboard"
        className="px-6 py-2.5 rounded-lg bg-neon-cyan/10 text-neon-cyan text-sm font-bold hover:bg-neon-cyan/20 transition"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
