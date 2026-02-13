import { run } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * Verify all deployed contracts on Basescan.
 * 
 * Usage:
 *   npx hardhat run scripts/verify.ts --network baseSepolia
 *   npx hardhat run scripts/verify.ts --network base
 * 
 * Requires:
 *   - BASESCAN_API_KEY env var
 *   - Deployed contracts (addresses from deployments/<network>.json)
 */
async function main() {
  const networkName = process.env.HARDHAT_NETWORK || "hardhat";
  const deploymentsPath = path.join(__dirname, "..", "deployments", `${networkName}.json`);

  if (!fs.existsSync(deploymentsPath)) {
    console.error(`No deployment file found at ${deploymentsPath}`);
    console.error("Run the deploy script first: npm run deploy:sepolia (or deploy:mainnet)");
    process.exit(1);
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
  const contracts = deployment.contracts;
  const allocations = deployment.allocations;

  console.log("===========================================");
  console.log("SurvivorPicks Contract Verification");
  console.log(`Network: ${networkName}`);
  console.log("===========================================\n");

  const verificationTasks = [
    {
      name: "PicksToken",
      address: contracts.PicksToken,
      constructorArguments: [
        allocations.communityRewards,
        allocations.liquidity,
        allocations.teamWallet,
        deployment.deployer, // presale tokens initially go to deployer
        allocations.stakingRewards,
        allocations.ecosystem,
      ],
    },
    {
      name: "Treasury",
      address: contracts.Treasury,
      constructorArguments: [contracts.PicksToken],
    },
    {
      name: "PredictionEngine",
      address: contracts.PredictionEngine,
      constructorArguments: [contracts.PicksToken, contracts.Treasury],
    },
    {
      name: "StakingVault",
      address: contracts.StakingVault,
      constructorArguments: [contracts.PicksToken],
    },
    {
      name: "BadgeNFT",
      address: contracts.BadgeNFT,
      constructorArguments: [
        "https://api.survivorpicks.com/badges/",
        contracts.Treasury,
      ],
    },
    {
      name: "SeasonPass",
      address: contracts.SeasonPass,
      constructorArguments: [
        contracts.PicksToken,
        "SurvivorPicks Season Pass",
        "SPPASS",
      ],
    },
    {
      name: "BondingCurvePresale",
      address: contracts.BondingCurvePresale,
      constructorArguments: [contracts.PicksToken],
    },
  ];

  let success = 0;
  let failed = 0;

  for (const task of verificationTasks) {
    try {
      console.log(`Verifying ${task.name} at ${task.address}...`);
      await run("verify:verify", {
        address: task.address,
        constructorArguments: task.constructorArguments,
      });
      console.log(`  ${task.name} verified successfully!\n`);
      success++;
    } catch (error: any) {
      if (error.message?.includes("Already Verified")) {
        console.log(`  ${task.name} is already verified.\n`);
        success++;
      } else {
        console.error(`  Failed to verify ${task.name}: ${error.message}\n`);
        failed++;
      }
    }
  }

  console.log("===========================================");
  console.log(`Verification Complete: ${success} success, ${failed} failed`);
  console.log("===========================================");

  if (failed > 0) {
    console.log("\nFailed contracts can be retried or verified manually at:");
    console.log(networkName === "base" 
      ? "https://basescan.org/verifyContract"
      : "https://sepolia.basescan.org/verifyContract"
    );
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
