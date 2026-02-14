import { expect } from "chai";
import { ethers } from "hardhat";
import { type SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { type RealityPicksNFT } from "../typechain-types";

describe("RealityPicksNFT", function () {
  let nft: RealityPicksNFT;
  let owner: SignerWithAddress;
  let signer: SignerWithAddress;
  let treasury: SignerWithAddress;
  let liquidity: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  const TIER_EARLY_SUPPORTER = 0;
  const TIER_PLAYER = 1;
  const TIER_COMMUNITY_OG = 2;
  const TIER_SURVIVOR_PRO = 3;
  const TIER_LEGEND = 4;

  const PRICE_EARLY = ethers.parseEther("0.000111");
  const PRICE_PLAYER = ethers.parseEther("0.00111");
  const PRICE_COMMUNITY = ethers.parseEther("0.00333");
  const PRICE_SURVIVOR = ethers.parseEther("0.00888");
  const PRICE_LEGEND = ethers.parseEther("0.0111");

  async function createSignature(
    signerWallet: SignerWithAddress,
    userAddress: string,
    tierId: number,
    nonce: number,
    contractAddress: string
  ) {
    const chainId = (await ethers.provider.getNetwork()).chainId;
    const messageHash = ethers.solidityPackedKeccak256(
      ["address", "uint256", "uint256", "uint256", "address"],
      [userAddress, tierId, nonce, chainId, contractAddress]
    );
    return signerWallet.signMessage(ethers.getBytes(messageHash));
  }

  beforeEach(async function () {
    [owner, signer, treasury, liquidity, user1, user2] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("RealityPicksNFT");
    nft = await Factory.deploy(
      "https://api.realitypicks.xyz/nft/",
      treasury.address,
      liquidity.address,
      signer.address
    );
    await nft.waitForDeployment();
  });

  // ─── Deployment ────────────────────────────────────────────────────

  describe("Deployment", function () {
    it("should set correct name and symbol", async function () {
      expect(await nft.name()).to.equal("RealityPicks Collection");
      expect(await nft.symbol()).to.equal("RPNFT");
    });

    it("should set correct receivers", async function () {
      expect(await nft.treasuryReceiver()).to.equal(treasury.address);
      expect(await nft.liquidityReceiver()).to.equal(liquidity.address);
    });

    it("should configure Early Supporter as active and open", async function () {
      const tier = await nft.getTierInfo(TIER_EARLY_SUPPORTER);
      expect(tier.name_).to.equal("Early Supporter");
      expect(tier.maxSupply_).to.equal(1111n);
      expect(tier.price_).to.equal(PRICE_EARLY);
      expect(tier.active_).to.be.true;
      expect(tier.requireSig_).to.be.false;
    });

    it("should configure higher tiers as inactive", async function () {
      for (const tierId of [TIER_PLAYER, TIER_COMMUNITY_OG, TIER_SURVIVOR_PRO, TIER_LEGEND]) {
        const tier = await nft.getTierInfo(tierId);
        expect(tier.active_).to.be.false;
      }
    });

    it("should mark Legend as soulbound", async function () {
      const tier = await nft.getTierInfo(TIER_LEGEND);
      expect(tier.soulbound_).to.be.true;
    });
  });

  // ─── Open Mint (Tier 0: Early Supporter) ─────────────────────────

  describe("Open Mint - Early Supporter", function () {
    it("should mint successfully with correct ETH", async function () {
      await nft.connect(user1).mint(TIER_EARLY_SUPPORTER, { value: PRICE_EARLY });
      expect(await nft.balanceOf(user1.address)).to.equal(1n);
      expect(await nft.tokenTier(1)).to.equal(0n);
    });

    it("should revert with wrong ETH amount", async function () {
      await expect(
        nft.connect(user1).mint(TIER_EARLY_SUPPORTER, { value: 0 })
      ).to.be.revertedWith("Wrong ETH amount");
    });

    it("should prevent double-minting same tier", async function () {
      await nft.connect(user1).mint(TIER_EARLY_SUPPORTER, { value: PRICE_EARLY });
      await expect(
        nft.connect(user1).mint(TIER_EARLY_SUPPORTER, { value: PRICE_EARLY })
      ).to.be.revertedWith("Already minted this tier");
    });

    it("should revert for signature-gated tiers", async function () {
      await nft.toggleTier(TIER_PLAYER); // activate
      await expect(
        nft.connect(user1).mint(TIER_PLAYER, { value: PRICE_PLAYER })
      ).to.be.revertedWith("Signature required");
    });

    it("should revert for invalid tier", async function () {
      await expect(
        nft.connect(user1).mint(99, { value: PRICE_EARLY })
      ).to.be.revertedWith("Invalid tier");
    });
  });

  // ─── Revenue Split ────────────────────────────────────────────────

  describe("Revenue Split", function () {
    it("should split revenue 75/25", async function () {
      const liqBefore = await ethers.provider.getBalance(liquidity.address);
      const trsBefore = await ethers.provider.getBalance(treasury.address);

      await nft.connect(user1).mint(TIER_EARLY_SUPPORTER, { value: PRICE_EARLY });

      const liqAfter = await ethers.provider.getBalance(liquidity.address);
      const trsAfter = await ethers.provider.getBalance(treasury.address);

      const expectedLiquidity = (PRICE_EARLY * 7500n) / 10000n;
      const expectedTreasury = PRICE_EARLY - expectedLiquidity;

      expect(liqAfter - liqBefore).to.equal(expectedLiquidity);
      expect(trsAfter - trsBefore).to.equal(expectedTreasury);
    });
  });

  // ─── Signature-Gated Mint ─────────────────────────────────────────

  describe("Signature-Gated Mint", function () {
    beforeEach(async function () {
      // Activate Player tier
      await nft.toggleTier(TIER_PLAYER);
    });

    it("should mint with valid signature", async function () {
      const sig = await createSignature(
        signer, user1.address, TIER_PLAYER, 0, await nft.getAddress()
      );

      await nft.connect(user1).mintWithSignature(TIER_PLAYER, sig, { value: PRICE_PLAYER });
      expect(await nft.balanceOf(user1.address)).to.equal(1n);
    });

    it("should reject invalid signature", async function () {
      // Sign with wrong signer
      const sig = await createSignature(
        user2, user1.address, TIER_PLAYER, 0, await nft.getAddress()
      );

      await expect(
        nft.connect(user1).mintWithSignature(TIER_PLAYER, sig, { value: PRICE_PLAYER })
      ).to.be.revertedWith("Invalid signature");
    });

    it("should prevent replay (nonce increments)", async function () {
      const sig = await createSignature(
        signer, user1.address, TIER_PLAYER, 0, await nft.getAddress()
      );

      await nft.connect(user1).mintWithSignature(TIER_PLAYER, sig, { value: PRICE_PLAYER });

      // Activate another tier and try reuse
      await nft.toggleTier(TIER_COMMUNITY_OG);
      await expect(
        nft.connect(user1).mintWithSignature(TIER_COMMUNITY_OG, sig, { value: PRICE_COMMUNITY })
      ).to.be.revertedWith("Invalid signature");
    });

    it("should work with incremented nonce for second tier", async function () {
      const sig0 = await createSignature(
        signer, user1.address, TIER_PLAYER, 0, await nft.getAddress()
      );
      await nft.connect(user1).mintWithSignature(TIER_PLAYER, sig0, { value: PRICE_PLAYER });

      await nft.toggleTier(TIER_COMMUNITY_OG);
      const sig1 = await createSignature(
        signer, user1.address, TIER_COMMUNITY_OG, 1, await nft.getAddress()
      );
      await nft.connect(user1).mintWithSignature(TIER_COMMUNITY_OG, sig1, { value: PRICE_COMMUNITY });

      expect(await nft.balanceOf(user1.address)).to.equal(2n);
    });
  });

  // ─── Soulbound ────────────────────────────────────────────────────

  describe("Soulbound (Legend)", function () {
    beforeEach(async function () {
      await nft.toggleTier(TIER_LEGEND);
    });

    it("should prevent transfer of Legend NFT", async function () {
      const sig = await createSignature(
        signer, user1.address, TIER_LEGEND, 0, await nft.getAddress()
      );
      await nft.connect(user1).mintWithSignature(TIER_LEGEND, sig, { value: PRICE_LEGEND });

      const tokenId = await nft.tokenOfOwnerByIndex(user1.address, 0);
      await expect(
        nft.connect(user1).transferFrom(user1.address, user2.address, tokenId)
      ).to.be.revertedWith("Soulbound: non-transferable");
    });

    it("should allow transfer of non-soulbound NFTs", async function () {
      await nft.connect(user1).mint(TIER_EARLY_SUPPORTER, { value: PRICE_EARLY });
      const tokenId = await nft.tokenOfOwnerByIndex(user1.address, 0);

      await nft.connect(user1).transferFrom(user1.address, user2.address, tokenId);
      expect(await nft.ownerOf(tokenId)).to.equal(user2.address);
    });
  });

  // ─── Supply Cap ───────────────────────────────────────────────────

  describe("Supply Caps", function () {
    it("should track minted count correctly", async function () {
      await nft.connect(user1).mint(TIER_EARLY_SUPPORTER, { value: PRICE_EARLY });
      const tier = await nft.getTierInfo(TIER_EARLY_SUPPORTER);
      expect(tier.minted_).to.equal(1n);
      expect(tier.remaining_).to.equal(1110n);
    });
  });

  // ─── Admin ────────────────────────────────────────────────────────

  describe("Admin", function () {
    it("should toggle tier active status", async function () {
      await nft.toggleTier(TIER_PLAYER);
      let tier = await nft.getTierInfo(TIER_PLAYER);
      expect(tier.active_).to.be.true;

      await nft.toggleTier(TIER_PLAYER);
      tier = await nft.getTierInfo(TIER_PLAYER);
      expect(tier.active_).to.be.false;
    });

    it("should update trusted signer", async function () {
      await nft.setTrustedSigner(user2.address);
      expect(await nft.trustedSigner()).to.equal(user2.address);
    });

    it("should reject non-owner admin calls", async function () {
      await expect(
        nft.connect(user1).toggleTier(TIER_PLAYER)
      ).to.be.reverted;
    });
  });

  // ─── Royalties ────────────────────────────────────────────────────

  describe("Royalties (EIP-2981)", function () {
    it("should return 5% royalty to treasury", async function () {
      const salePrice = ethers.parseEther("1");
      const [receiver, amount] = await nft.royaltyInfo(1, salePrice);
      expect(receiver).to.equal(treasury.address);
      expect(amount).to.equal(ethers.parseEther("0.05"));
    });
  });

  // ─── getUserTiers ─────────────────────────────────────────────────

  describe("getUserTiers", function () {
    it("should return tiers held by user", async function () {
      await nft.connect(user1).mint(TIER_EARLY_SUPPORTER, { value: PRICE_EARLY });

      await nft.toggleTier(TIER_PLAYER);
      const sig = await createSignature(
        signer, user1.address, TIER_PLAYER, 0, await nft.getAddress()
      );
      await nft.connect(user1).mintWithSignature(TIER_PLAYER, sig, { value: PRICE_PLAYER });

      const userTiers = await nft.getUserTiers(user1.address);
      expect(userTiers.length).to.equal(2);
      expect(userTiers[0]).to.equal(0n); // Early Supporter
      expect(userTiers[1]).to.equal(1n); // Player
    });
  });
});
