import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("BondingCurvePresale", function () {
  async function deployFixture() {
    const [owner, buyer1, buyer2, community, liquidity, team, presaleWallet, staking, ecosystem] =
      await ethers.getSigners();

    const PicksToken = await ethers.getContractFactory("PicksToken");
    const token = await PicksToken.deploy(
      community.address, liquidity.address, team.address,
      presaleWallet.address, staking.address, ecosystem.address
    );

    const BondingCurvePresale = await ethers.getContractFactory("BondingCurvePresale");
    const presale = await BondingCurvePresale.deploy(await token.getAddress());

    // Transfer presale allocation to the presale contract (10% = 100M)
    const presaleAmount = ethers.parseEther("100000000");
    await token.connect(presaleWallet).transfer(await presale.getAddress(), presaleAmount);

    return { token, presale, owner, buyer1, buyer2, presaleAmount };
  }

  describe("Configuration", function () {
    it("should start the sale", async function () {
      const { presale, presaleAmount } = await loadFixture(deployFixture);

      // Base price: 0.000001 ETH per token, slope: 0.0000000001 ETH per 1e18 tokens sold
      await presale.startSale(
        ethers.parseEther("0.000001"),   // basePrice
        ethers.parseEther("0.0000000001"), // slope
        presaleAmount                     // maxTokens
      );

      expect(await presale.saleActive()).to.be.true;
      expect(await presale.currentPrice()).to.equal(ethers.parseEther("0.000001"));
    });
  });

  describe("Purchasing", function () {
    it("should allow buying tokens", async function () {
      const { token, presale, buyer1, presaleAmount } = await loadFixture(deployFixture);

      await presale.startSale(
        ethers.parseEther("0.000001"),
        ethers.parseEther("0.0000000001"),
        presaleAmount
      );

      const amount = ethers.parseEther("1000"); // Buy 1000 tokens
      const cost = await presale.calculateCost(amount);

      await presale.connect(buyer1).buy(amount, { value: cost });

      expect(await token.balanceOf(buyer1.address)).to.equal(amount);
      expect(await presale.totalSold()).to.equal(amount);
    });

    it("should increase price as tokens are sold", async function () {
      const { presale, buyer1, presaleAmount } = await loadFixture(deployFixture);

      await presale.startSale(
        ethers.parseEther("0.000001"),
        ethers.parseEther("0.0000000001"),
        presaleAmount
      );

      const priceBefore = await presale.currentPrice();

      const amount = ethers.parseEther("1000000"); // Buy 1M tokens
      const cost = await presale.calculateCost(amount);
      await presale.connect(buyer1).buy(amount, { value: cost });

      const priceAfter = await presale.currentPrice();
      expect(priceAfter).to.be.gt(priceBefore);
    });

    it("should reject purchase below minimum", async function () {
      const { presale, buyer1, presaleAmount } = await loadFixture(deployFixture);

      await presale.startSale(
        ethers.parseEther("0.000001"),
        ethers.parseEther("0.0000000001"),
        presaleAmount
      );

      let reverted = false;
      try {
        await presale.connect(buyer1).buy(ethers.parseEther("10"), { value: ethers.parseEther("1") });
      } catch { reverted = true; }
      expect(reverted).to.be.true;
    });

    it("should reject when sale is not active", async function () {
      const { presale, buyer1 } = await loadFixture(deployFixture);

      let reverted = false;
      try {
        await presale.connect(buyer1).buy(ethers.parseEther("1000"), { value: ethers.parseEther("1") });
      } catch { reverted = true; }
      expect(reverted).to.be.true;
    });

    it("should refund excess ETH", async function () {
      const { presale, buyer1, presaleAmount } = await loadFixture(deployFixture);

      await presale.startSale(
        ethers.parseEther("0.000001"),
        ethers.parseEther("0.0000000001"),
        presaleAmount
      );

      const amount = ethers.parseEther("1000");
      const cost = await presale.calculateCost(amount);
      const overPayment = cost + ethers.parseEther("0.5"); // Send extra 0.5 ETH

      const balBefore = await ethers.provider.getBalance(buyer1.address);
      const tx = await presale.connect(buyer1).buy(amount, { value: overPayment });
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;
      const balAfter = await ethers.provider.getBalance(buyer1.address);

      // User should only have paid cost + gas, not the full overPayment
      const actualCost = balBefore - balAfter - gasUsed;
      // Allow small tolerance for gas estimation
      expect(actualCost).to.be.lte(cost + 1000n);
    });
  });

  describe("Finalization", function () {
    it("should finalize and return unsold tokens", async function () {
      const { token, presale, owner, buyer1, presaleAmount } = await loadFixture(deployFixture);

      await presale.startSale(
        ethers.parseEther("0.000001"),
        ethers.parseEther("0.0000000001"),
        presaleAmount
      );

      // Buy some tokens
      const buyAmount = ethers.parseEther("1000");
      const cost = await presale.calculateCost(buyAmount);
      await presale.connect(buyer1).buy(buyAmount, { value: cost });

      const ownerBalBefore = await token.balanceOf(owner.address);
      await presale.finalizeSale();
      const ownerBalAfter = await token.balanceOf(owner.address);

      // Owner should receive unsold tokens
      const unsold = presaleAmount - buyAmount;
      expect(ownerBalAfter - ownerBalBefore).to.equal(unsold);
      expect(await presale.saleActive()).to.be.false;
      expect(await presale.finalized()).to.be.true;
    });
  });

  describe("View Functions", function () {
    it("should provide accurate quotes", async function () {
      const { presale, presaleAmount } = await loadFixture(deployFixture);

      await presale.startSale(
        ethers.parseEther("0.000001"),
        ethers.parseEther("0.0000000001"),
        presaleAmount
      );

      const amount = ethers.parseEther("10000");
      const [cost, priceAfter] = await presale.getQuote(amount);

      expect(cost).to.be.gt(0n);
      expect(priceAfter).to.be.gt(await presale.currentPrice());
    });

    it("should track remaining tokens", async function () {
      const { presale, buyer1, presaleAmount } = await loadFixture(deployFixture);

      await presale.startSale(
        ethers.parseEther("0.000001"),
        ethers.parseEther("0.0000000001"),
        presaleAmount
      );

      expect(await presale.remainingTokens()).to.equal(presaleAmount);

      const buyAmount = ethers.parseEther("1000");
      const cost = await presale.calculateCost(buyAmount);
      await presale.connect(buyer1).buy(buyAmount, { value: cost });

      expect(await presale.remainingTokens()).to.equal(presaleAmount - buyAmount);
    });
  });
});
