import { ethers, network } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("===========================================");
  console.log("SurvivorPicks Contract Deployment");
  console.log("===========================================");
  console.log(`Network: ${network.name}`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Balance: ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} ETH`);
  console.log("-------------------------------------------");

  // ─── Configuration ────────────────────────────────────────────────
  // For mainnet, set these env vars to actual multisig/vesting addresses.
  // For testnet/dev, deployer receives all allocations.
  const communityRewards = process.env.COMMUNITY_REWARDS_WALLET || deployer.address;
  const liquidity = process.env.LIQUIDITY_WALLET || deployer.address;
  const teamWallet = process.env.TEAM_WALLET || deployer.address;
  const stakingRewards = process.env.STAKING_REWARDS_WALLET || deployer.address;
  const ecosystem = process.env.ECOSYSTEM_WALLET || deployer.address;
  const presaleReceiver = deployer.address;

  // ─── 1. Get or Deploy PicksToken ────────────────────────────────
  let tokenAddress = process.env.PICKS_TOKEN_ADDRESS || "";
  const usingExistingToken = !!tokenAddress;

  if (usingExistingToken) {
    console.log(`\n1. Using existing token (Clanker or other): ${tokenAddress}`);
  } else {
    console.log("\n1. Deploying PicksToken...");
    const PicksToken = await ethers.getContractFactory("PicksToken");
    const token = await PicksToken.deploy(
      communityRewards, liquidity, teamWallet, presaleReceiver, stakingRewards, ecosystem
    );
    await token.waitForDeployment();
    tokenAddress = await token.getAddress();
    console.log(`   PicksToken deployed: ${tokenAddress}`);
  }

  // ─── 2. Deploy Treasury ──────────────────────────────────────────
  console.log("\n2. Deploying Treasury...");
  const Treasury = await ethers.getContractFactory("Treasury");
  const treasury = await Treasury.deploy(tokenAddress);
  await treasury.waitForDeployment();
  const treasuryAddress = await treasury.getAddress();
  console.log(`   Treasury deployed: ${treasuryAddress}`);

  // ─── 3. Deploy PredictionEngine ──────────────────────────────────
  console.log("\n3. Deploying PredictionEngine...");
  const PredictionEngine = await ethers.getContractFactory("PredictionEngine");
  const engine = await PredictionEngine.deploy(tokenAddress, treasuryAddress);
  await engine.waitForDeployment();
  const engineAddress = await engine.getAddress();
  console.log(`   PredictionEngine deployed: ${engineAddress}`);

  // ─── 4. Deploy StakingVault ──────────────────────────────────────
  console.log("\n4. Deploying StakingVault...");
  const StakingVault = await ethers.getContractFactory("StakingVault");
  const vault = await StakingVault.deploy(tokenAddress);
  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();
  console.log(`   StakingVault deployed: ${vaultAddress}`);

  // ─── 5. Deploy BadgeNFT ──────────────────────────────────────────
  console.log("\n5. Deploying BadgeNFT...");
  const BadgeNFT = await ethers.getContractFactory("BadgeNFT");
  const badge = await BadgeNFT.deploy(
    "https://api.survivorpicks.com/badges/",
    treasuryAddress
  );
  await badge.waitForDeployment();
  const badgeAddress = await badge.getAddress();
  console.log(`   BadgeNFT deployed: ${badgeAddress}`);

  // ─── 6. Deploy SeasonPass ────────────────────────────────────────
  console.log("\n6. Deploying SeasonPass...");
  const SeasonPass = await ethers.getContractFactory("SeasonPass");
  const pass = await SeasonPass.deploy(tokenAddress, "SurvivorPicks Season Pass", "SPPASS");
  await pass.waitForDeployment();
  const passAddress = await pass.getAddress();
  console.log(`   SeasonPass deployed: ${passAddress}`);

  // ─── 7. Deploy BondingCurvePresale (only for custom token) ────────
  let presaleAddress = "";
  if (!usingExistingToken) {
    console.log("\n7. Deploying BondingCurvePresale...");
    const BondingCurvePresale = await ethers.getContractFactory("BondingCurvePresale");
    const presale = await BondingCurvePresale.deploy(tokenAddress);
    await presale.waitForDeployment();
    presaleAddress = await presale.getAddress();
    console.log(`   BondingCurvePresale deployed: ${presaleAddress}`);
  } else {
    console.log("\n7. Skipping BondingCurvePresale (using existing token)");
  }

  // ─── 8. Post-Deployment Configuration ────────────────────────────
  console.log("\n8. Post-deployment configuration...");

  // Grant MINTER_ROLE on BadgeNFT to PredictionEngine
  const MINTER_ROLE = await badge.MINTER_ROLE();
  await badge.grantRole(MINTER_ROLE, engineAddress);
  console.log("   BadgeNFT: granted MINTER_ROLE to PredictionEngine");

  // Grant RESOLVER_ROLE on PredictionEngine to deployer (admin)
  const RESOLVER_ROLE = await engine.RESOLVER_ROLE();
  console.log(`   PredictionEngine: deployer already has RESOLVER_ROLE`);

  // Token distribution (only when we deployed our own token)
  if (!usingExistingToken) {
    const tokenContract = await ethers.getContractAt("PicksToken", tokenAddress);

    // Transfer presale allocation tokens to BondingCurvePresale contract
    const presaleAllocation = ethers.parseEther("100000000"); // 100M tokens (10%)
    await tokenContract.transfer(presaleAddress, presaleAllocation);
    console.log(`   Transferred 100M $PICKS to BondingCurvePresale contract`);

    // Fund StakingVault with staking rewards allocation
    const stakingAllocation = ethers.parseEther("100000000"); // 100M tokens (10%)
    if (stakingRewards === deployer.address) {
      await tokenContract.transfer(vaultAddress, stakingAllocation);
      console.log(`   Transferred 100M $PICKS to StakingVault for rewards`);
    }

    // Configure presale bonding curve parameters
    const presaleBasePrice = ethers.parseEther("0.0000001");
    const presaleSlope = ethers.parseEther("0.0000000001");
    const presaleMaxTokens = presaleAllocation;
    const presaleContract = await ethers.getContractAt("BondingCurvePresale", presaleAddress);
    await presaleContract.startSale(presaleBasePrice, presaleSlope, presaleMaxTokens);
    console.log("   BondingCurvePresale: sale configured and started");
    console.log(`   - Base price: ${ethers.formatEther(presaleBasePrice)} ETH/token`);
    console.log(`   - Slope: ${ethers.formatEther(presaleSlope)} ETH/1e18 tokens`);
    console.log(`   - Max tokens: ${ethers.formatEther(presaleMaxTokens)} PICKS`);
  } else {
    console.log("   Skipping token distribution (using existing Clanker token)");
  }

  // ─── Summary ─────────────────────────────────────────────────────
  console.log("\n===========================================");
  console.log("Deployment Complete!");
  console.log("===========================================");

  const contracts: Record<string, string> = {
    PicksToken: tokenAddress,
    Treasury: treasuryAddress,
    PredictionEngine: engineAddress,
    StakingVault: vaultAddress,
    BadgeNFT: badgeAddress,
    SeasonPass: passAddress,
  };
  if (presaleAddress) {
    contracts.BondingCurvePresale = presaleAddress;
  }

  const addresses: Record<string, any> = {
    network: network.name,
    chainId: network.config.chainId,
    deployer: deployer.address,
    tokenSource: usingExistingToken ? "existing/clanker" : "custom",
    contracts,
    deployedAt: new Date().toISOString(),
  };

  if (!usingExistingToken) {
    addresses.allocations = {
      communityRewards,
      liquidity,
      teamWallet,
      stakingRewards,
      ecosystem,
    };
  }

  console.log(JSON.stringify(addresses, null, 2));

  // Write addresses to file for frontend consumption
  const fs = await import("fs");
  const path = await import("path");
  const outputPath = path.join(__dirname, "..", "deployments", `${network.name}.json`);
  const outputDir = path.dirname(outputPath);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(addresses, null, 2));
  console.log(`\nAddresses saved to: ${outputPath}`);

  // Also generate a .env snippet for Next.js
  let envSnippet = `
# ─── Contract Addresses (${network.name}) ───
NEXT_PUBLIC_CHAIN=${network.name === "base" ? "mainnet" : network.name === "baseSepolia" ? "testnet" : "local"}
NEXT_PUBLIC_PICKS_TOKEN_ADDRESS=${tokenAddress}
NEXT_PUBLIC_TREASURY_ADDRESS=${treasuryAddress}
NEXT_PUBLIC_PREDICTION_ENGINE_ADDRESS=${engineAddress}
NEXT_PUBLIC_STAKING_VAULT_ADDRESS=${vaultAddress}
NEXT_PUBLIC_BADGE_NFT_ADDRESS=${badgeAddress}
NEXT_PUBLIC_SEASON_PASS_ADDRESS=${passAddress}`.trim();

  if (presaleAddress) {
    envSnippet += `\nNEXT_PUBLIC_BONDING_CURVE_PRESALE_ADDRESS=${presaleAddress}`;
  }

  const envPath = path.join(__dirname, "..", "deployments", `${network.name}.env`);
  fs.writeFileSync(envPath, envSnippet);
  console.log(`Env snippet saved to: ${envPath}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
