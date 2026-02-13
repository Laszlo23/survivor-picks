import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("PicksToken", function () {
  async function deployFixture() {
    const [owner, community, liquidity, team, presale, staking, ecosystem, user1] =
      await ethers.getSigners();

    const PicksToken = await ethers.getContractFactory("PicksToken");
    const token = await PicksToken.deploy(
      community.address,
      liquidity.address,
      team.address,
      presale.address,
      staking.address,
      ecosystem.address
    );

    const TOTAL_SUPPLY = ethers.parseEther("1000000000"); // 1B

    return { token, owner, community, liquidity, team, presale, staking, ecosystem, user1, TOTAL_SUPPLY };
  }

  describe("Deployment", function () {
    it("should have correct name and symbol", async function () {
      const { token } = await loadFixture(deployFixture);
      expect(await token.name()).to.equal("SurvivorPicks");
      expect(await token.symbol()).to.equal("PICKS");
    });

    it("should mint total supply of 1 billion tokens", async function () {
      const { token, TOTAL_SUPPLY } = await loadFixture(deployFixture);
      expect(await token.totalSupply()).to.equal(TOTAL_SUPPLY);
    });

    it("should distribute 40% to community rewards", async function () {
      const { token, community, TOTAL_SUPPLY } = await loadFixture(deployFixture);
      const expected = (TOTAL_SUPPLY * 4000n) / 10000n;
      expect(await token.balanceOf(community.address)).to.equal(expected);
    });

    it("should distribute 20% to liquidity", async function () {
      const { token, liquidity, TOTAL_SUPPLY } = await loadFixture(deployFixture);
      const expected = (TOTAL_SUPPLY * 2000n) / 10000n;
      expect(await token.balanceOf(liquidity.address)).to.equal(expected);
    });

    it("should distribute 15% to team", async function () {
      const { token, team, TOTAL_SUPPLY } = await loadFixture(deployFixture);
      const expected = (TOTAL_SUPPLY * 1500n) / 10000n;
      expect(await token.balanceOf(team.address)).to.equal(expected);
    });

    it("should distribute 10% to presale", async function () {
      const { token, presale, TOTAL_SUPPLY } = await loadFixture(deployFixture);
      const expected = (TOTAL_SUPPLY * 1000n) / 10000n;
      expect(await token.balanceOf(presale.address)).to.equal(expected);
    });

    it("should distribute 10% to staking rewards", async function () {
      const { token, staking, TOTAL_SUPPLY } = await loadFixture(deployFixture);
      const expected = (TOTAL_SUPPLY * 1000n) / 10000n;
      expect(await token.balanceOf(staking.address)).to.equal(expected);
    });

    it("should distribute 5% to ecosystem", async function () {
      const { token, ecosystem, TOTAL_SUPPLY } = await loadFixture(deployFixture);
      const expected = (TOTAL_SUPPLY * 500n) / 10000n;
      expect(await token.balanceOf(ecosystem.address)).to.equal(expected);
    });

    it("should have zero balance for deployer", async function () {
      const { token, owner } = await loadFixture(deployFixture);
      expect(await token.balanceOf(owner.address)).to.equal(0n);
    });

    it("should revert if any allocation address is zero", async function () {
      const [, community, liquidity, team, presale, staking] = await ethers.getSigners();
      const PicksToken = await ethers.getContractFactory("PicksToken");
      let reverted = false;
      try {
        await PicksToken.deploy(
          ethers.ZeroAddress,
          liquidity.address,
          team.address,
          presale.address,
          staking.address,
          community.address
        );
      } catch {
        reverted = true;
      }
      expect(reverted).to.be.true;
    });
  });

  describe("Burning", function () {
    it("should allow token holders to burn their tokens", async function () {
      const { token, community } = await loadFixture(deployFixture);
      const burnAmount = ethers.parseEther("1000");
      const balBefore = await token.balanceOf(community.address);

      await token.connect(community).burn(burnAmount);

      expect(await token.balanceOf(community.address)).to.equal(balBefore - burnAmount);
    });

    it("should reduce total supply when tokens are burned", async function () {
      const { token, community, TOTAL_SUPPLY } = await loadFixture(deployFixture);
      const burnAmount = ethers.parseEther("5000");

      await token.connect(community).burn(burnAmount);

      expect(await token.totalSupply()).to.equal(TOTAL_SUPPLY - burnAmount);
    });
  });

  describe("Transfers", function () {
    it("should allow standard ERC20 transfers", async function () {
      const { token, community, user1 } = await loadFixture(deployFixture);
      const amount = ethers.parseEther("100");

      await token.connect(community).transfer(user1.address, amount);

      expect(await token.balanceOf(user1.address)).to.equal(amount);
    });
  });
});
