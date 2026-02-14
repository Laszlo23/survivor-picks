import { ethers, network } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("===========================================");
  console.log("RealityPicks NFT Collection Deployment");
  console.log("===========================================");
  console.log(`Network:  ${network.name}`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Balance:  ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} ETH`);
  console.log("-------------------------------------------");

  // ─── Configuration ────────────────────────────────────────────────
  // Treasury: existing on-chain treasury contract
  const treasuryAddress = process.env.TREASURY_ADDRESS || deployer.address;
  // Liquidity: wallet/contract that adds to PICKS LP
  const liquidityAddress = process.env.LIQUIDITY_WALLET || deployer.address;
  // Trusted signer: backend wallet that signs eligibility proofs
  const trustedSigner = process.env.NFT_SIGNER_ADDRESS || deployer.address;
  // Base URI for NFT metadata
  const baseURI = process.env.NFT_BASE_URI || "https://api.realitypicks.xyz/nft/";

  console.log(`Treasury:       ${treasuryAddress}`);
  console.log(`Liquidity:      ${liquidityAddress}`);
  console.log(`Trusted Signer: ${trustedSigner}`);
  console.log(`Base URI:       ${baseURI}`);
  console.log("-------------------------------------------");

  // ─── Deploy ───────────────────────────────────────────────────────
  console.log("\nDeploying RealityPicksNFT...");
  const Factory = await ethers.getContractFactory("RealityPicksNFT");
  const nft = await Factory.deploy(
    baseURI,
    treasuryAddress,
    liquidityAddress,
    trustedSigner
  );
  await nft.waitForDeployment();
  const nftAddress = await nft.getAddress();
  console.log(`RealityPicksNFT deployed: ${nftAddress}`);

  // ─── Verify Tier Configuration ────────────────────────────────────
  console.log("\nTier Configuration:");
  const tierNames = ["Early Supporter", "Player", "Community OG", "Survivor Pro", "Legend"];
  for (let i = 0; i < 5; i++) {
    const tier = await nft.getTierInfo(i);
    console.log(`  Tier ${i} (${tierNames[i]}): ${tier.maxSupply_} max, ${ethers.formatEther(tier.price_)} ETH, active=${tier.active_}, soulbound=${tier.soulbound_}`);
  }

  // ─── Summary ─────────────────────────────────────────────────────
  const addresses = {
    network: network.name,
    chainId: network.config.chainId,
    deployer: deployer.address,
    contracts: {
      RealityPicksNFT: nftAddress,
    },
    config: {
      treasuryAddress,
      liquidityAddress,
      trustedSigner,
      baseURI,
    },
    deployedAt: new Date().toISOString(),
  };

  console.log("\n===========================================");
  console.log("Deployment Complete!");
  console.log("===========================================");
  console.log(JSON.stringify(addresses, null, 2));

  // Write addresses to file
  const fs = await import("fs");
  const path = await import("path");
  const outputDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, `${network.name}-nft.json`);
  fs.writeFileSync(outputPath, JSON.stringify(addresses, null, 2));
  console.log(`\nAddresses saved to: ${outputPath}`);

  // Generate .env snippet
  const envSnippet = `
# ─── RealityPicks NFT (${network.name}) ───
NEXT_PUBLIC_REALITYPICKS_NFT_ADDRESS=${nftAddress}
NFT_SIGNER_PRIVATE_KEY=<SET_THIS_TO_YOUR_SIGNER_PRIVATE_KEY>
`.trim();

  const envPath = path.join(outputDir, `${network.name}-nft.env`);
  fs.writeFileSync(envPath, envSnippet);
  console.log(`Env snippet saved to: ${envPath}`);

  console.log(`
──────────────────────────────────────────
 NEXT STEPS:
  1. Set NFT_SIGNER_PRIVATE_KEY in your .env
  2. Add NEXT_PUBLIC_REALITYPICKS_NFT_ADDRESS to .env
  3. To activate higher tiers, call:
     - toggleTier(1) for Player
     - toggleTier(2) for Community OG
     - toggleTier(3) for Survivor Pro
     - toggleTier(4) for Legend
──────────────────────────────────────────
  `);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
