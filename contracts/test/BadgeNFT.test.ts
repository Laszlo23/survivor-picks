import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("BadgeNFT", function () {
  async function deployFixture() {
    const [owner, minter, user1, user2, treasury] = await ethers.getSigners();

    const BadgeNFT = await ethers.getContractFactory("BadgeNFT");
    const badge = await BadgeNFT.deploy("https://api.realitypicks.xyz/badges/", treasury.address);

    const MINTER_ROLE = await badge.MINTER_ROLE();
    await badge.grantRole(MINTER_ROLE, minter.address);

    return { badge, owner, minter, user1, user2, treasury, MINTER_ROLE };
  }

  describe("Badge Creation", function () {
    it("should create a soulbound badge", async function () {
      const { badge } = await loadFixture(deployFixture);
      await badge.createBadge(1, true, "ipfs://badge1");
      expect(await badge.badgeExists(1)).to.be.true;
      expect(await badge.isSoulbound(1)).to.be.true;
    });

    it("should create a tradeable badge", async function () {
      const { badge } = await loadFixture(deployFixture);
      await badge.createBadge(2, false, "ipfs://badge2");
      expect(await badge.badgeExists(2)).to.be.true;
      expect(await badge.isSoulbound(2)).to.be.false;
    });

    it("should reject duplicate badge IDs", async function () {
      const { badge } = await loadFixture(deployFixture);
      await badge.createBadge(1, true, "ipfs://badge1");
      let reverted = false;
      try { await badge.createBadge(1, false, "ipfs://badge1b"); } catch { reverted = true; }
      expect(reverted).to.be.true;
    });
  });

  describe("Minting", function () {
    it("should mint a badge to a user", async function () {
      const { badge, minter, user1 } = await loadFixture(deployFixture);
      await badge.createBadge(1, true, "ipfs://badge1");
      await badge.connect(minter).mint(user1.address, 1);

      expect(await badge.balanceOf(user1.address, 1)).to.equal(1n);
      expect(await badge.hasBadge(user1.address, 1)).to.be.true;
    });

    it("should not allow duplicate badge for same user", async function () {
      const { badge, minter, user1 } = await loadFixture(deployFixture);
      await badge.createBadge(1, true, "ipfs://badge1");
      await badge.connect(minter).mint(user1.address, 1);

      let reverted = false;
      try { await badge.connect(minter).mint(user1.address, 1); } catch { reverted = true; }
      expect(reverted).to.be.true;
    });

    it("should track user badges", async function () {
      const { badge, minter, user1 } = await loadFixture(deployFixture);
      await badge.createBadge(1, true, "ipfs://badge1");
      await badge.createBadge(2, false, "ipfs://badge2");
      await badge.connect(minter).mint(user1.address, 1);
      await badge.connect(minter).mint(user1.address, 2);

      const badges = await badge.getUserBadges(user1.address);
      expect(badges.length).to.equal(2);
    });
  });

  describe("Soulbound Transfers", function () {
    it("should block transfer of soulbound badges", async function () {
      const { badge, minter, user1, user2 } = await loadFixture(deployFixture);
      await badge.createBadge(1, true, "ipfs://soulbound");
      await badge.connect(minter).mint(user1.address, 1);

      let reverted = false;
      try {
        await badge.connect(user1).safeTransferFrom(user1.address, user2.address, 1, 1, "0x");
      } catch { reverted = true; }
      expect(reverted).to.be.true;
    });

    it("should allow transfer of tradeable badges", async function () {
      const { badge, minter, user1, user2 } = await loadFixture(deployFixture);
      await badge.createBadge(2, false, "ipfs://tradeable");
      await badge.connect(minter).mint(user1.address, 2);

      await badge.connect(user1).safeTransferFrom(user1.address, user2.address, 2, 1, "0x");
      expect(await badge.balanceOf(user2.address, 2)).to.equal(1n);
    });
  });

  describe("Royalties", function () {
    it("should return 5% royalty info", async function () {
      const { badge, treasury } = await loadFixture(deployFixture);
      const [receiver, amount] = await badge.royaltyInfo(1, ethers.parseEther("1"));
      expect(receiver).to.equal(treasury.address);
      expect(amount).to.equal(ethers.parseEther("0.05"));
    });
  });

  describe("URI", function () {
    it("should return custom URI for badge with set URI", async function () {
      const { badge } = await loadFixture(deployFixture);
      await badge.createBadge(1, true, "ipfs://QmCustomHash");
      expect(await badge.uri(1)).to.equal("ipfs://QmCustomHash");
    });
  });
});
