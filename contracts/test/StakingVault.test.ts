import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";

describe("StakingVault", function () {
  async function deployFixture() {
    const [owner, user1, user2, community, liquidity, team, presale, staking, ecosystem] =
      await ethers.getSigners();

    const PicksToken = await ethers.getContractFactory("PicksToken");
    const token = await PicksToken.deploy(
      community.address, liquidity.address, team.address,
      presale.address, staking.address, ecosystem.address
    );

    const StakingVault = await ethers.getContractFactory("StakingVault");
    const vault = await StakingVault.deploy(await token.getAddress());

    // Give users tokens
    const userAmount = ethers.parseEther("200000");
    await token.connect(community).transfer(user1.address, userAmount);
    await token.connect(community).transfer(user2.address, userAmount);

    // Fund vault with staking rewards
    const rewardAmount = ethers.parseEther("1000000");
    await token.connect(staking).transfer(await vault.getAddress(), rewardAmount);

    // Users approve
    const vaultAddr = await vault.getAddress();
    await token.connect(user1).approve(vaultAddr, ethers.MaxUint256);
    await token.connect(user2).approve(vaultAddr, ethers.MaxUint256);

    return { token, vault, owner, user1, user2 };
  }

  describe("Staking", function () {
    it("should allow staking", async function () {
      const { vault, user1 } = await loadFixture(deployFixture);
      await vault.connect(user1).stake(ethers.parseEther("5000"));

      const info = await vault.getStakeInfo(user1.address);
      expect(info.amount).to.equal(ethers.parseEther("5000"));
    });

    it("should update total staked", async function () {
      const { vault, user1, user2 } = await loadFixture(deployFixture);
      await vault.connect(user1).stake(ethers.parseEther("1000"));
      await vault.connect(user2).stake(ethers.parseEther("2000"));
      expect(await vault.totalStaked()).to.equal(ethers.parseEther("3000"));
    });

    it("should allow unstaking", async function () {
      const { token, vault, user1 } = await loadFixture(deployFixture);
      await vault.connect(user1).stake(ethers.parseEther("5000"));

      const before = await token.balanceOf(user1.address);
      await vault.connect(user1).unstake(ethers.parseEther("2000"));
      const after_ = await token.balanceOf(user1.address);

      expect(after_ - before).to.equal(ethers.parseEther("2000"));
      const info = await vault.getStakeInfo(user1.address);
      expect(info.amount).to.equal(ethers.parseEther("3000"));
    });
  });

  describe("Tiers", function () {
    it("should return no tier for insufficient stake", async function () {
      const { vault, user1 } = await loadFixture(deployFixture);
      await vault.connect(user1).stake(ethers.parseEther("500"));
      expect(await vault.getUserTier(user1.address)).to.equal(0n);
    });

    it("should return bronze after 7 days with 1000+ staked", async function () {
      const { vault, user1 } = await loadFixture(deployFixture);
      await vault.connect(user1).stake(ethers.parseEther("1000"));
      await time.increase(7 * 24 * 3600);
      expect(await vault.getUserTier(user1.address)).to.equal(1n);
      expect(await vault.getBoostBPS(user1.address)).to.equal(11000n);
    });

    it("should return silver after 30 days with 10000+ staked", async function () {
      const { vault, user1 } = await loadFixture(deployFixture);
      await vault.connect(user1).stake(ethers.parseEther("10000"));
      await time.increase(30 * 24 * 3600);
      expect(await vault.getUserTier(user1.address)).to.equal(2n);
      expect(await vault.getBoostBPS(user1.address)).to.equal(12500n);
    });

    it("should return gold after 90 days with 100000+ staked", async function () {
      const { vault, user1 } = await loadFixture(deployFixture);
      await vault.connect(user1).stake(ethers.parseEther("100000"));
      await time.increase(90 * 24 * 3600);
      expect(await vault.getUserTier(user1.address)).to.equal(3n);
      expect(await vault.getBoostBPS(user1.address)).to.equal(15000n);
    });
  });

  describe("Rewards", function () {
    it("should accumulate rewards over time", async function () {
      const { vault, owner, user1 } = await loadFixture(deployFixture);

      // Set reward rate: 1 token per second for 1000 seconds
      await vault.connect(owner).setRewardRate(ethers.parseEther("1"), 1000);

      await vault.connect(user1).stake(ethers.parseEther("1000"));
      await time.increase(100);

      const pending = await vault.pendingRewards(user1.address);
      // ~100 tokens (1 per second * 100 seconds)
      expect(pending).to.be.gte(ethers.parseEther("99"));
      expect(pending).to.be.lte(ethers.parseEther("101"));
    });

    it("should allow claiming rewards", async function () {
      const { token, vault, owner, user1 } = await loadFixture(deployFixture);

      await vault.connect(owner).setRewardRate(ethers.parseEther("1"), 1000);
      await vault.connect(user1).stake(ethers.parseEther("1000"));
      await time.increase(50);

      const before = await token.balanceOf(user1.address);
      await vault.connect(user1).claimRewards();
      const after_ = await token.balanceOf(user1.address);

      expect(after_ - before).to.be.gte(ethers.parseEther("49"));
    });
  });
});
