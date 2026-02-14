import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// ─── NFT Tier Requirements ────────────────────────────────────────────

const TIER_REQUIREMENTS = {
  0: { name: "Early Supporter", requireSig: false },
  1: { name: "Player", minPredictions: 10 },
  2: { name: "Community OG", minReferrals: 3, requiresTier: 0 },
  3: { name: "Survivor Pro", minWinRate: 70, minPredictions: 25, requiresTier: 1 },
  4: { name: "Legend", topLeaderboard: 10, requiresTier: 3 },
} as const;

// ─── Chain config ────────────────────────────────────────────────────

function getChainId(): number {
  const env = process.env.NEXT_PUBLIC_CHAIN;
  if (env === "mainnet") return 8453;
  if (env === "testnet") return 84532;
  return 31337;
}

// ─── GET /api/nft/eligibility ────────────────────────────────────────

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user's wallet address
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { walletAddress: true },
    });

    if (!user?.walletAddress) {
      return Response.json({
        error: "Connect your wallet first",
        tiers: buildEmptyTiers(),
      }, { status: 400 });
    }

    const walletAddress = user.walletAddress as `0x${string}`;

    // Gather user stats
    const [predictionCount, resolvedPredictions, referralCount, leaderboardRank] =
      await Promise.all([
        // Total predictions made
        prisma.prediction.count({ where: { userId } }),
        // Resolved predictions for win rate
        prisma.prediction.findMany({
          where: { userId, isCorrect: { not: null } },
          select: { isCorrect: true },
        }),
        // Referral count (completed)
        prisma.referral.count({
          where: { referrerId: userId, status: "COMPLETED" },
        }),
        // Leaderboard rank across all seasons
        getLeaderboardRank(userId),
      ]);

    const correctCount = resolvedPredictions.filter((p) => p.isCorrect).length;
    const totalResolved = resolvedPredictions.length;
    const winRate = totalResolved > 0 ? (correctCount / totalResolved) * 100 : 0;

    // Check eligibility for each tier
    const tiers = [];
    const signerKey = process.env.NFT_SIGNER_PRIVATE_KEY;
    const contractAddress = process.env.NEXT_PUBLIC_REALITYPICKS_NFT_ADDRESS as `0x${string}` | undefined;
    const chainId = getChainId();

    // Fetch on-chain tier holdings for tiers that require a prerequisite NFT
    const userTiers = await getUserOnChainTiers(walletAddress, chainId, contractAddress);

    for (let tierId = 0; tierId < 5; tierId++) {
      const { eligible, reason } = checkEligibility(tierId, {
        predictionCount,
        winRate,
        totalResolved,
        referralCount,
        leaderboardRank,
        userTiers,
      });

      let signature: string | null = null;

      // Generate signature for eligible gated tiers
      if (eligible && tierId > 0 && signerKey && contractAddress) {
        try {
          signature = await generateSignature(
            signerKey as `0x${string}`,
            walletAddress,
            tierId,
            chainId,
            contractAddress
          );
        } catch (e) {
          console.error(`Failed to generate signature for tier ${tierId}:`, e);
        }
      }

      tiers.push({
        tierId,
        name: TIER_REQUIREMENTS[tierId as keyof typeof TIER_REQUIREMENTS].name,
        eligible,
        reason,
        signature,
      });
    }

    return Response.json(
      {
        walletAddress,
        stats: {
          predictionCount,
          winRate: Math.round(winRate * 10) / 10,
          totalResolved,
          referralCount,
          leaderboardRank,
        },
        tiers,
      },
      {
        headers: { "Cache-Control": "private, max-age=60" },
      }
    );
  } catch (error) {
    console.error("NFT eligibility error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────

function checkEligibility(
  tierId: number,
  stats: {
    predictionCount: number;
    winRate: number;
    totalResolved: number;
    referralCount: number;
    leaderboardRank: number | null;
    userTiers: number[]; // on-chain tiers the user already holds
  }
): { eligible: boolean; reason: string } {
  switch (tierId) {
    case 0: // Early Supporter — open to all
      return { eligible: true, reason: "Open mint — first come, first served!" };

    case 1: // Player — 10+ predictions
      if (stats.predictionCount >= 10) {
        return { eligible: true, reason: `${stats.predictionCount} predictions made` };
      }
      return {
        eligible: false,
        reason: `Make ${10 - stats.predictionCount} more predictions (${stats.predictionCount}/10)`,
      };

    case 2: { // Community OG — 3+ referrals + hold Early Supporter
      const hasEarlySup = stats.userTiers.includes(0);
      const hasReferrals = stats.referralCount >= 3;
      if (hasEarlySup && hasReferrals) {
        return { eligible: true, reason: `${stats.referralCount} friends referred + Early Supporter held` };
      }
      const missing = [];
      if (!hasReferrals)
        missing.push(`Refer ${3 - stats.referralCount} more friends (${stats.referralCount}/3)`);
      if (!hasEarlySup) missing.push("Mint the Early Supporter NFT first");
      return { eligible: false, reason: missing.join(" & ") };
    }

    case 3: { // Survivor Pro — 70% win rate, 25+ predictions + hold Player
      const hasPlayer = stats.userTiers.includes(1);
      const hasStats = stats.totalResolved >= 25 && stats.winRate >= 70;
      if (hasPlayer && hasStats) {
        return {
          eligible: true,
          reason: `${stats.winRate.toFixed(1)}% win rate with ${stats.totalResolved} predictions + Player NFT held`,
        };
      }
      const parts = [];
      if (stats.totalResolved < 25)
        parts.push(`${25 - stats.totalResolved} more resolved predictions needed`);
      if (stats.winRate < 70)
        parts.push(`${stats.winRate.toFixed(1)}% win rate (need 70%)`);
      if (!hasPlayer) parts.push("Mint the Player NFT first");
      return { eligible: false, reason: parts.join(" & ") };
    }

    case 4: { // Legend — Top 10 leaderboard + hold Survivor Pro
      const hasSurvivorPro = stats.userTiers.includes(3);
      const inTop10 = stats.leaderboardRank !== null && stats.leaderboardRank <= 10;
      if (hasSurvivorPro && inTop10) {
        return { eligible: true, reason: `Rank #${stats.leaderboardRank} on leaderboard + Survivor Pro held` };
      }
      const parts2 = [];
      if (!inTop10)
        parts2.push(
          stats.leaderboardRank
            ? `Currently rank #${stats.leaderboardRank} (need Top 10)`
            : "Get on the leaderboard"
        );
      if (!hasSurvivorPro) parts2.push("Mint the Survivor Pro NFT first");
      return { eligible: false, reason: parts2.join(" & ") };
    }

    default:
      return { eligible: false, reason: "Unknown tier" };
  }
}

/**
 * Query the on-chain contract to see which tier NFTs the user already holds.
 * Returns an array of tier IDs (e.g. [0, 1] means they hold Early Supporter + Player).
 */
async function getUserOnChainTiers(
  walletAddress: `0x${string}`,
  chainId: number,
  contractAddress: `0x${string}` | undefined
): Promise<number[]> {
  if (!contractAddress || contractAddress === "0x0") return [];

  try {
    const { createPublicClient, http } = await import("viem");
    const { base, baseSepolia, hardhat } = await import("viem/chains");
    const { ABIS } = await import("@/lib/web3/abis");

    const chain = chainId === 8453 ? base : chainId === 84532 ? baseSepolia : hardhat;
    const rpcUrl =
      chainId === 8453
        ? process.env.BASE_MAINNET_RPC || "https://mainnet.base.org"
        : chainId === 84532
        ? process.env.BASE_SEPOLIA_RPC || "https://sepolia.base.org"
        : "http://127.0.0.1:8545";

    const client = createPublicClient({ chain, transport: http(rpcUrl) });

    const result = await client.readContract({
      address: contractAddress,
      abi: ABIS.RealityPicksNFT,
      functionName: "getUserTiers",
      args: [walletAddress],
    });

    // Result is an array of BigInts representing tier IDs the user holds
    return (result as bigint[]).map((t) => Number(t));
  } catch (e) {
    console.warn("Failed to fetch on-chain NFT tiers (contract may not be deployed):", e);
    return [];
  }
}

async function getLeaderboardRank(userId: string): Promise<number | null> {
  try {
    // Get rank from UserSeasonStats across all active seasons
    const stats = await prisma.userSeasonStats.findMany({
      where: { userId },
      orderBy: { points: "desc" },
      take: 1,
    });

    if (stats.length === 0) return null;

    const best = stats[0];
    const higherRanked = await prisma.userSeasonStats.count({
      where: {
        seasonId: best.seasonId,
        points: { gt: best.points },
      },
    });

    return higherRanked + 1;
  } catch {
    return null;
  }
}

async function generateSignature(
  privateKey: `0x${string}`,
  userAddress: `0x${string}`,
  tierId: number,
  chainId: number,
  contractAddress: `0x${string}`
): Promise<string> {
  // Dynamic imports to avoid webpack issues in API routes
  const { privateKeyToAccount } = await import("viem/accounts");
  const { createPublicClient, http, keccak256, encodePacked } = await import("viem");
  const { base, baseSepolia, hardhat } = await import("viem/chains");

  const account = privateKeyToAccount(privateKey);

  const chain = chainId === 8453 ? base : chainId === 84532 ? baseSepolia : hardhat;
  const rpcUrl =
    chainId === 8453
      ? process.env.BASE_MAINNET_RPC || "https://mainnet.base.org"
      : chainId === 84532
      ? process.env.BASE_SEPOLIA_RPC || "https://sepolia.base.org"
      : "http://127.0.0.1:8545";

  const publicClient = createPublicClient({
    chain,
    transport: http(rpcUrl),
  });

  const { ABIS } = await import("@/lib/web3/abis");

  const nonce = await publicClient.readContract({
    address: contractAddress,
    abi: ABIS.RealityPicksNFT,
    functionName: "getNonce",
    args: [userAddress],
  });

  const messageHash = keccak256(
    encodePacked(
      ["address", "uint256", "uint256", "uint256", "address"],
      [userAddress, BigInt(tierId), nonce as bigint, BigInt(chainId), contractAddress]
    )
  );

  const signature = await account.signMessage({
    message: { raw: messageHash as `0x${string}` },
  });

  return signature;
}

function buildEmptyTiers() {
  return [0, 1, 2, 3, 4].map((tierId) => ({
    tierId,
    name: TIER_REQUIREMENTS[tierId as keyof typeof TIER_REQUIREMENTS].name,
    eligible: false,
    reason: "Connect wallet to check eligibility",
    signature: null,
  }));
}
