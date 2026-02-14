/**
 * Deploy $PICKS token via Clanker SDK v4
 *
 * This script uses the official Clanker SDK to deploy the token on-chain.
 * No API key needed -- it signs the transaction with your wallet directly.
 *
 * Prerequisites:
 *   - DEPLOYER_PRIVATE_KEY in .env
 *   - ETH on Base for gas (~0.01 ETH)
 *
 * Usage:
 *   npx tsx scripts/deploy-token-clanker.ts
 *
 * After deployment, the token address is printed and saved to
 * deployments/clanker-token.json. Then run the utility contracts:
 *   PICKS_TOKEN_ADDRESS=0x... npm run deploy:clanker:mainnet
 */

import { Clanker } from "clanker-sdk/v4";
import {
  createWalletClient,
  createPublicClient,
  privateKeyToAccount,
  http,
} from "viem";
import { base } from "viem/chains";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
  if (!privateKey) {
    console.error("ERROR: Set DEPLOYER_PRIVATE_KEY in .env");
    process.exit(1);
  }

  const account = privateKeyToAccount(privateKey as `0x${string}`);

  const rpcUrl = process.env.BASE_MAINNET_RPC || "https://mainnet.base.org";

  const publicClient = createPublicClient({
    chain: base,
    transport: http(rpcUrl),
  });

  const walletClient = createWalletClient({
    account,
    chain: base,
    transport: http(rpcUrl),
  });

  const balance = await publicClient.getBalance({ address: account.address });
  const balanceEth = Number(balance) / 1e18;

  console.log("===========================================");
  console.log("RealityPicks — Clanker Token Deployment");
  console.log("===========================================");
  console.log(`Deployer:  ${account.address}`);
  console.log(`Balance:   ${balanceEth.toFixed(4)} ETH`);
  console.log(`Chain:     Base (${base.id})`);
  console.log("-------------------------------------------");

  if (balanceEth < 0.005) {
    console.error("ERROR: Insufficient balance. Need at least 0.005 ETH for gas.");
    process.exit(1);
  }

  // Reward recipient (defaults to deployer)
  const rewardRecipient = (process.env.REWARD_RECIPIENT || account.address) as `0x${string}`;

  console.log("\nDeploying $PICKS via Clanker SDK v4...");
  console.log("  Name:          RealityPicks");
  console.log("  Symbol:        PICKS");
  console.log("  Vault:         50% locked 7d, vesting 730d");
  console.log("  Fees:          Static 1% both sides");
  console.log("  Rewards:       100% to", rewardRecipient);
  console.log("");

  const clanker = new Clanker({
    publicClient: publicClient as any,
    wallet: walletClient as any,
  });

  const { waitForTransaction, error: deployError } = await clanker.deploy({
    name: "RealityPicks",
    symbol: "PICKS",
    tokenAdmin: account.address,
    image: process.env.TOKEN_IMAGE_URL || "",
    metadata: {
      description:
        "The utility token for RealityPicks — stake on reality TV predictions, earn rewards, collect NFT badges.",
      socialMediaUrls: [
        process.env.TWITTER_URL || "",
        process.env.WEBSITE_URL || "",
      ].filter(Boolean).map((url) => ({
        platform: url.includes("x.com") || url.includes("twitter") ? "twitter" : "website",
        url,
      })),
    },
    context: {
      interface: "RealityPicks",
    },
    fees: {
      type: "static",
      clankerFee: 100, // 1% in bps
      pairedFee: 100,  // 1% in bps
    },
    rewards: {
      recipients: [
        {
          recipient: rewardRecipient,
          admin: account.address,
          bps: 10_000, // 100%
          token: "Both",
        },
      ],
    },
    vault: {
      percentage: 50,
      lockupDuration: 7 * 24 * 60 * 60,    // 7 days in seconds
      vestingDuration: 730 * 24 * 60 * 60,  // 730 days in seconds
    },
    // Optional: initial dev buy
    ...(process.env.DEV_BUY_ETH
      ? {
          devBuy: {
            ethAmount: parseFloat(process.env.DEV_BUY_ETH),
          },
        }
      : {}),
  });

  if (deployError) {
    console.error("Clanker deployment failed:", deployError);
    process.exit(1);
  }

  console.log("Transaction submitted, waiting for confirmation...");

  const { address: tokenAddress } = await waitForTransaction();

  if (!tokenAddress) {
    console.error("ERROR: No token address returned from Clanker");
    process.exit(1);
  }

  console.log("\n===========================================");
  console.log("Token Deployed Successfully!");
  console.log("===========================================");
  console.log(`Token Address: ${tokenAddress}`);
  console.log(`Clanker Admin: https://www.clanker.world/clanker/${tokenAddress}/admin`);
  console.log(`Basescan:      https://basescan.org/token/${tokenAddress}`);
  console.log(`DEX Screener:  https://dexscreener.com/base/${tokenAddress}`);
  console.log(`Uniswap:       https://app.uniswap.org/swap?chain=base&outputCurrency=${tokenAddress}`);

  // Save deployment info
  const outputDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const deploymentInfo = {
    token: {
      address: tokenAddress,
      name: "RealityPicks",
      symbol: "PICKS",
      chain: "base",
      chainId: 8453,
    },
    deployer: account.address,
    rewardRecipient,
    clankerAdmin: `https://www.clanker.world/clanker/${tokenAddress}/admin`,
    deployedAt: new Date().toISOString(),
  };

  const jsonPath = path.join(outputDir, "clanker-token.json");
  fs.writeFileSync(jsonPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\nSaved to: ${jsonPath}`);

  // Print next steps
  console.log("\n─── Next Steps ────────────────────────────");
  console.log("1. Deploy utility contracts:");
  console.log(`   PICKS_TOKEN_ADDRESS=${tokenAddress} npm run deploy:clanker:mainnet`);
  console.log("2. Verify contracts:");
  console.log("   npm run verify:clanker:mainnet");
  console.log("3. Copy addresses to frontend .env:");
  console.log("   cat deployments/base-clanker.env >> ../.env.local");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
