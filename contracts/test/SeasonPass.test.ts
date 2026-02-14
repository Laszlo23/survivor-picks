import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("SeasonPass", function () {
  async function deployFixture() {
    const [owner, user1, user2, community, liquidity, team, presale, staking, ecosystem] =
      await ethers.getSigners();

    const PicksToken = await ethers.getContractFactory("PicksToken");
    const token = await PicksToken.deploy(
      community.address, liquidity.address, team.address,
      presale.address, staking.address, ecosystem.address
    );

    const SeasonPass = await ethers.getContractFactory("SeasonPass");
    const pass = await SeasonPass.deploy(await token.getAddress(), "RealityPicks Season Pass", "SPPASS");

    // Give users tokens
    const userAmount = ethers.parseEther("500000");
    await token.connect(community).transfer(user1.address, userAmount);
    await token.connect(community).transfer(user2.address, userAmount);

    // Users approve pass contract
    const passAddr = await pass.getAddress();
    await token.connect(user1).approve(passAddr, ethers.MaxUint256);
    await token.connect(user2).approve(passAddr, ethers.MaxUint256);

    return { token, pass, owner, user1, user2 };
  }

  describe("Season Configuration", function () {
    it("should configure a season", async function () {
      const { pass } = await loadFixture(deployFixture);
      await pass.configureSeason(
        ethers.id("s1"), 100, ethers.parseEther("1000"), ethers.parseEther("10")
      );
      expect(await pass.maxSupply()).to.equal(100n);
      expect(await pass.basePrice()).to.equal(ethers.parseEther("1000"));
    });
  });

  describe("Purchase", function () {
    it("should allow purchase when sale is active", async function () {
      const { token, pass, user1 } = await loadFixture(deployFixture);
      await pass.configureSeason(
        ethers.id("s1"), 100, ethers.parseEther("1000"), ethers.parseEther("10")
      );
      await pass.toggleSale();

      const supplyBefore = await token.totalSupply();
      await pass.connect(user1).purchase();

      // Should own token #1
      expect(await pass.ownerOf(1)).to.equal(user1.address);
      // Tokens should be burned
      const supplyAfter = await token.totalSupply();
      expect(supplyBefore - supplyAfter).to.equal(ethers.parseEther("1000"));
    });

    it("should increase price with each purchase (bonding curve)", async function () {
      const { pass, user1, user2 } = await loadFixture(deployFixture);
      await pass.configureSeason(
        ethers.id("s1"), 100, ethers.parseEther("1000"), ethers.parseEther("100")
      );
      await pass.toggleSale();

      const price1 = await pass.currentPrice();
      expect(price1).to.equal(ethers.parseEther("1000"));

      await pass.connect(user1).purchase();

      const price2 = await pass.currentPrice();
      expect(price2).to.equal(ethers.parseEther("1100")); // 1000 + 100

      await pass.connect(user2).purchase();

      const price3 = await pass.currentPrice();
      expect(price3).to.equal(ethers.parseEther("1200")); // 1000 + 200
    });

    it("should reject purchase when sale not active", async function () {
      const { pass, user1 } = await loadFixture(deployFixture);
      await pass.configureSeason(
        ethers.id("s1"), 100, ethers.parseEther("1000"), ethers.parseEther("10")
      );

      let reverted = false;
      try { await pass.connect(user1).purchase(); } catch { reverted = true; }
      expect(reverted).to.be.true;
    });

    it("should check hasActivePass", async function () {
      const { pass, user1 } = await loadFixture(deployFixture);
      await pass.configureSeason(
        ethers.id("s1"), 100, ethers.parseEther("1000"), ethers.parseEther("10")
      );
      await pass.toggleSale();

      expect(await pass.hasActivePass(user1.address)).to.be.false;
      await pass.connect(user1).purchase();
      expect(await pass.hasActivePass(user1.address)).to.be.true;
    });

    it("should track remaining supply", async function () {
      const { pass, user1 } = await loadFixture(deployFixture);
      await pass.configureSeason(
        ethers.id("s1"), 3, ethers.parseEther("100"), ethers.parseEther("10")
      );
      await pass.toggleSale();

      expect(await pass.remainingSupply()).to.equal(3n);
      await pass.connect(user1).purchase();
      expect(await pass.remainingSupply()).to.equal(2n);
    });
  });
});
