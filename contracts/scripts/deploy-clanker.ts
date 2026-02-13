import { ethers, network } from "hardhat";

/**
 * SurvivorPicks Deployment Script -- Clanker Token Flow
 *
 * This script is for when $PICKS has been deployed via Clanker (clanker.world).
 * It deploys only the utility contracts (Treasury, PredictionEngine, StakingVault,
 * BadgeNFT, SeasonPass) and points them at the Clanker-deployed token address.
 *
 * Usage:
 *   PICKS_TOKEN_ADDRESS=0x... npx hardhat run scripts/deploy-clanker.ts --network base
 *
 * Or deploy the token via Clanker API first (see deployClankerToken below),
 * then run the utility contracts deployment.
 */

// ─── Clanker API Integration ─────────────────────────────────────────

interface ClankerDeployParams {
  name: string;
  symbol: string;
  image?: string;
  description?: string;
  tokenAdmin: string;
  socialMediaUrls?: string[];
  vaultPercentage?: number;
  vaultLockupDays?: number;
  vaultVestingDays?: number;
  airdropEntries?: { account: string; amount: number }[];
  airdropLockupDays?: number;
  airdropVestingDays?: number;
  initialMarketCap?: number;
  rewardRecipient: string;
  apiKey: string;
}

async function deployClankerToken(params: ClankerDeployParams): Promise<string> {
  // Generate a unique 32-char request key
  const requestKey = Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join("");

  const body: Record<string, any> = {
    token: {
      name: params.name,
      symbol: params.symbol,
      image: params.image || "",
      tokenAdmin: params.tokenAdmin,
      description: params.description || "",
      socialMediaUrls: (params.socialMediaUrls || []).map((url) => ({
        platform: url.includes("x.com") || url.includes("twitter") ? "twitter" : "website",
        url,
      })),
      requestKey,
    },
    rewards: [
      {
        admin: params.tokenAdmin,
        recipient: params.rewardRecipient,
        allocation: 100,
        rewardsToken: "Both",
      },
    ],
    pool: {
      type: "standard",
      pairedToken: "0x4200000000000000000000000000000000000006", // WETH on Base
      initialMarketCap: params.initialMarketCap || 10,
    },
    fees: {
      type: "static",
      clankerFee: 1,
      pairedFee: 1,
    },
    chainId: 8453, // Base mainnet
  };

  // Add vault extension if configured
  if (params.vaultPercentage && params.vaultPercentage > 0) {
    body.vault = {
      percentage: params.vaultPercentage,
      lockupDuration: params.vaultLockupDays || 7,
      vestingDuration: params.vaultVestingDays || 0,
    };
  }

  // Add airdrop extension if configured
  if (params.airdropEntries && params.airdropEntries.length > 0) {
    body.airdrop = {
      entries: params.airdropEntries,
      lockupDuration: params.airdropLockupDays || 1,
      vestingDuration: params.airdropVestingDays || 0,
    };
  }

  console.log("Calling Clanker API to deploy token...");
  console.log("Request body:", JSON.stringify(body, null, 2));

  const response = await fetch("https://www.clanker.world/api/tokens/deploy/v4", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": params.apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Clanker API error (${response.status}): ${JSON.stringify(errorData)}`
    );
  }

  const data = await response.json();
  console.log("Clanker API response:", JSON.stringify(data, null, 2));

  if (!data.expectedAddress) {
    throw new Error("Clanker API did not return an expectedAddress");
  }

  return data.expectedAddress;
}

// ─── Main Deployment ─────────────────────────────────────────────────

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("===========================================");
  console.log("SurvivorPicks Deployment (Clanker Token)");
  console.log("===========================================");
  console.log(`Network: ${network.name}`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(
    `Balance: ${ethers.formatEther(
      await ethers.provider.getBalance(deployer.address)
    )} ETH`
  );
  console.log("-------------------------------------------");

  // ─── Step 1: Get or Deploy Token ───────────────────────────────────
  let tokenAddress = process.env.PICKS_TOKEN_ADDRESS || "";

  if (tokenAddress) {
    console.log(`\n1. Using existing token: ${tokenAddress}`);
  } else if (process.env.CLANKER_API_KEY) {
    console.log("\n1. Deploying $PICKS via Clanker API...");
    tokenAddress = await deployClankerToken({
      name: "SurvivorPicks",
      symbol: "PICKS",
      image: process.env.TOKEN_IMAGE_URL || "",
      description:
        "The utility token for SurvivorPicks -- stake on Survivor predictions, earn rewards, collect NFT badges.",
      tokenAdmin: deployer.address,
      socialMediaUrls: [
        process.env.TWITTER_URL || "",
        process.env.WEBSITE_URL || "",
      ].filter(Boolean),
      // Vault: 50% locked 7 days, vesting over 2 years
      vaultPercentage: 50,
      vaultLockupDays: 7,
      vaultVestingDays: 730,
      // Starting market cap of ~10 WETH
      initialMarketCap: 10,
      rewardRecipient: process.env.REWARD_RECIPIENT || deployer.address,
      apiKey: process.env.CLANKER_API_KEY,
    });
    console.log(`   $PICKS token deployed via Clanker: ${tokenAddress}`);
    console.log("   Token is now live on Uniswap V4 (Base)!");
  } else {
    console.error(
      "ERROR: Set PICKS_TOKEN_ADDRESS (existing Clanker token) or CLANKER_API_KEY (to deploy new token)"
    );
    process.exit(1);
  }

  // Helper: wait a bit between deploys to avoid nonce race conditions on public RPCs
  const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));

  // ─── Step 2: Deploy Treasury ───────────────────────────────────────
  console.log("\n2. Deploying Treasury...");
  const Treasury = await ethers.getContractFactory("Treasury");
  const treasury = await Treasury.deploy(tokenAddress);
  await treasury.waitForDeployment();
  const treasuryAddress = await treasury.getAddress();
  console.log(`   Treasury deployed: ${treasuryAddress}`);
  await pause(3000);

  // ─── Step 3: Deploy PredictionEngine ───────────────────────────────
  console.log("\n3. Deploying PredictionEngine...");
  const PredictionEngine = await ethers.getContractFactory("PredictionEngine");
  const engine = await PredictionEngine.deploy(tokenAddress, treasuryAddress);
  await engine.waitForDeployment();
  const engineAddress = await engine.getAddress();
  console.log(`   PredictionEngine deployed: ${engineAddress}`);
  await pause(3000);

  // ─── Step 4: Deploy StakingVault ───────────────────────────────────
  console.log("\n4. Deploying StakingVault...");
  const StakingVault = await ethers.getContractFactory("StakingVault");
  const vault = await StakingVault.deploy(tokenAddress);
  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();
  console.log(`   StakingVault deployed: ${vaultAddress}`);
  await pause(3000);

  // ─── Step 5: Deploy BadgeNFT ───────────────────────────────────────
  console.log("\n5. Deploying BadgeNFT...");
  const BadgeNFT = await ethers.getContractFactory("BadgeNFT");
  const badge = await BadgeNFT.deploy(
    "https://api.survivorpicks.com/badges/",
    treasuryAddress
  );
  await badge.waitForDeployment();
  const badgeAddress = await badge.getAddress();
  console.log(`   BadgeNFT deployed: ${badgeAddress}`);
  await pause(3000);

  // ─── Step 6: Deploy SeasonPass ─────────────────────────────────────
  console.log("\n6. Deploying SeasonPass...");
  const SeasonPass = await ethers.getContractFactory("SeasonPass");
  const pass = await SeasonPass.deploy(
    tokenAddress,
    "SurvivorPicks Season Pass",
    "SPPASS"
  );
  await pass.waitForDeployment();
  const passAddress = await pass.getAddress();
  console.log(`   SeasonPass deployed: ${passAddress}`);
  await pause(3000);

  // ─── Step 7: Post-Deployment Configuration ─────────────────────────
  console.log("\n7. Post-deployment configuration...");

  // Grant MINTER_ROLE on BadgeNFT to PredictionEngine
  const MINTER_ROLE = await badge.MINTER_ROLE();
  await badge.grantRole(MINTER_ROLE, engineAddress);
  console.log("   BadgeNFT: granted MINTER_ROLE to PredictionEngine");

  console.log("   PredictionEngine: deployer has RESOLVER_ROLE");

  // ─── Summary ───────────────────────────────────────────────────────
  console.log("\n===========================================");
  console.log("Deployment Complete!");
  console.log("===========================================");

  const addresses = {
    network: network.name,
    chainId: network.config.chainId,
    deployer: deployer.address,
    tokenSource: process.env.PICKS_TOKEN_ADDRESS ? "existing" : "clanker",
    contracts: {
      PicksToken: tokenAddress,
      Treasury: treasuryAddress,
      PredictionEngine: engineAddress,
      StakingVault: vaultAddress,
      BadgeNFT: badgeAddress,
      SeasonPass: passAddress,
    },
    deployedAt: new Date().toISOString(),
  };

  console.log(JSON.stringify(addresses, null, 2));

  // Write addresses to file
  const fs = await import("fs");
  const path = await import("path");
  const outputDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, `${network.name}-clanker.json`);
  fs.writeFileSync(outputPath, JSON.stringify(addresses, null, 2));
  console.log(`\nAddresses saved to: ${outputPath}`);

  // Generate .env snippet
  const envSnippet = `
# ─── Contract Addresses (${network.name} - Clanker) ───
NEXT_PUBLIC_CHAIN=${network.name === "base" ? "mainnet" : network.name === "baseSepolia" ? "testnet" : "local"}
NEXT_PUBLIC_PICKS_TOKEN_ADDRESS=${tokenAddress}
NEXT_PUBLIC_TREASURY_ADDRESS=${treasuryAddress}
NEXT_PUBLIC_PREDICTION_ENGINE_ADDRESS=${engineAddress}
NEXT_PUBLIC_STAKING_VAULT_ADDRESS=${vaultAddress}
NEXT_PUBLIC_BADGE_NFT_ADDRESS=${badgeAddress}
NEXT_PUBLIC_SEASON_PASS_ADDRESS=${passAddress}
`.trim();

  const envPath = path.join(outputDir, `${network.name}-clanker.env`);
  fs.writeFileSync(envPath, envSnippet);
  console.log(`Env snippet saved to: ${envPath}`);

  // Print next steps
  console.log("\n─── Next Steps ────────────────────────────");
  console.log("1. Copy the env snippet above into your .env.local");
  console.log("2. Token is live on Uniswap V4 -- share the trading link!");
  console.log(`3. Manage token at: https://www.clanker.world/clanker/${tokenAddress}/admin`);
  console.log("4. Claim LP rewards at the admin page above");
  console.log("5. Verify contracts: npm run verify:mainnet");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
