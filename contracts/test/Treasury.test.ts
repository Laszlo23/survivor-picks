import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";

describe("Treasury", function () {
  async function deployFixture() {
    const [owner, teamWallet, community, liquidity, team, presale, staking, ecosystem] =
      await ethers.getSigners();

    const PicksToken = await ethers.getContractFactory("PicksToken");
    const token = await PicksToken.deploy(
      community.address, liquidity.address, team.address,
      presale.address, staking.address, ecosystem.address
    );

    const Treasury = await ethers.getContractFactory("Treasury");
    const treasury = await Treasury.deploy(await token.getAddress());

    // Fund treasury with tokens (simulating fee collection)
    const fundAmount = ethers.parseEther("100000");
    await token.connect(community).transfer(await treasury.getAddress(), fundAmount);

    return { token, treasury, owner, teamWallet };
  }

  describe("Buyback and Burn", function () {
    it("should burn tokens from treasury", async function () {
      const { token, treasury } = await loadFixture(deployFixture);
      const supplyBefore = await token.totalSupply();

      await treasury.buybackAndBurn(ethers.parseEther("5000"));

      const supplyAfter = await token.totalSupply();
      expect(supplyBefore - supplyAfter).to.equal(ethers.parseEther("5000"));
    });

    it("should track total burned", async function () {
      const { treasury } = await loadFixture(deployFixture);
      await treasury.buybackAndBurn(ethers.parseEther("1000"));
      await treasury.buybackAndBurn(ethers.parseEther("2000"));
      expect(await treasury.totalBurned()).to.equal(ethers.parseEther("3000"));
    });
  });

  describe("Timelocked Withdrawals", function () {
    it("should queue a withdrawal", async function () {
      const { treasury, teamWallet } = await loadFixture(deployFixture);
      await treasury.queueWithdrawal(teamWallet.address, ethers.parseEther("5000"));

      const w = await treasury.getPendingWithdrawal(0);
      expect(w.to).to.equal(teamWallet.address);
      expect(w.amount).to.equal(ethers.parseEther("5000"));
      expect(w.executed).to.be.false;
    });

    it("should reject withdrawal exceeding 10% cap", async function () {
      const { treasury, teamWallet } = await loadFixture(deployFixture);

      let reverted = false;
      try {
        // 100k in treasury, max 10% = 10k
        await treasury.queueWithdrawal(teamWallet.address, ethers.parseEther("15000"));
      } catch { reverted = true; }
      expect(reverted).to.be.true;
    });

    it("should not execute before timelock expires", async function () {
      const { treasury, teamWallet } = await loadFixture(deployFixture);
      await treasury.queueWithdrawal(teamWallet.address, ethers.parseEther("5000"));

      let reverted = false;
      try { await treasury.executeWithdrawal(0); } catch { reverted = true; }
      expect(reverted).to.be.true;
    });

    it("should execute after timelock expires", async function () {
      const { token, treasury, teamWallet } = await loadFixture(deployFixture);
      await treasury.queueWithdrawal(teamWallet.address, ethers.parseEther("5000"));

      // Fast forward 7 days
      await time.increase(7 * 24 * 3600 + 1);

      const before = await token.balanceOf(teamWallet.address);
      await treasury.executeWithdrawal(0);
      const after_ = await token.balanceOf(teamWallet.address);

      expect(after_ - before).to.equal(ethers.parseEther("5000"));
    });

    it("should allow cancellation", async function () {
      const { treasury, teamWallet } = await loadFixture(deployFixture);
      await treasury.queueWithdrawal(teamWallet.address, ethers.parseEther("5000"));
      await treasury.cancelWithdrawal(0);

      const w = await treasury.getPendingWithdrawal(0);
      expect(w.executed).to.be.true; // Marked as executed to prevent future exec
    });
  });

  describe("View Functions", function () {
    it("should report treasury balance", async function () {
      const { treasury } = await loadFixture(deployFixture);
      expect(await treasury.treasuryBalance()).to.equal(ethers.parseEther("100000"));
    });
  });
});
