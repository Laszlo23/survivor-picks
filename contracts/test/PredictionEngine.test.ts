import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";

describe("PredictionEngine", function () {
  async function deployFixture() {
    const [owner, resolver, user1, user2, user3, treasuryAddr, community, liquidity, team, presale, staking, ecosystem] =
      await ethers.getSigners();

    // Deploy token
    const PicksToken = await ethers.getContractFactory("PicksToken");
    const token = await PicksToken.deploy(
      community.address, liquidity.address, team.address,
      presale.address, staking.address, ecosystem.address
    );

    // Deploy prediction engine
    const PredictionEngine = await ethers.getContractFactory("PredictionEngine");
    const engine = await PredictionEngine.deploy(await token.getAddress(), treasuryAddr.address);

    // Grant resolver role
    const RESOLVER_ROLE = await engine.RESOLVER_ROLE();
    await engine.grantRole(RESOLVER_ROLE, resolver.address);

    // Give users some tokens from community pool
    const userAmount = ethers.parseEther("10000");
    await token.connect(community).transfer(user1.address, userAmount);
    await token.connect(community).transfer(user2.address, userAmount);
    await token.connect(community).transfer(user3.address, userAmount);

    // Users approve engine
    const engineAddr = await engine.getAddress();
    await token.connect(user1).approve(engineAddr, ethers.MaxUint256);
    await token.connect(user2).approve(engineAddr, ethers.MaxUint256);
    await token.connect(user3).approve(engineAddr, ethers.MaxUint256);

    return { token, engine, owner, resolver, user1, user2, user3, treasuryAddr, RESOLVER_ROLE };
  }

  describe("Question Creation", function () {
    it("should create a question", async function () {
      const { engine, resolver } = await loadFixture(deployFixture);
      const qId = ethers.id("q1");
      const epId = ethers.id("ep1");
      const lockTime = (await time.latest()) + 3600;

      await engine.connect(resolver).createQuestion(qId, epId, 4, lockTime);

      const q = await engine.getQuestion(qId);
      expect(q.optionCount).to.equal(4n);
      expect(q.resolved).to.be.false;
    });

    it("should reject duplicate question", async function () {
      const { engine, resolver } = await loadFixture(deployFixture);
      const qId = ethers.id("q1");
      const epId = ethers.id("ep1");
      const lockTime = (await time.latest()) + 3600;

      await engine.connect(resolver).createQuestion(qId, epId, 4, lockTime);

      let reverted = false;
      try { await engine.connect(resolver).createQuestion(qId, epId, 4, lockTime); } catch { reverted = true; }
      expect(reverted).to.be.true;
    });
  });

  describe("Predictions", function () {
    it("should accept a prediction", async function () {
      const { engine, resolver, user1 } = await loadFixture(deployFixture);
      const qId = ethers.id("q1");
      const lockTime = (await time.latest()) + 3600;

      await engine.connect(resolver).createQuestion(qId, ethers.id("ep1"), 3, lockTime);
      await engine.connect(user1).predict(qId, 2, ethers.parseEther("100"), false);

      const pred = await engine.getUserPrediction(qId, user1.address);
      expect(pred.option).to.equal(2n);
      expect(pred.amount).to.equal(ethers.parseEther("100"));
    });

    it("should reject prediction after lock time", async function () {
      const { engine, resolver, user1 } = await loadFixture(deployFixture);
      const qId = ethers.id("q1");
      const lockTime = (await time.latest()) + 10;

      await engine.connect(resolver).createQuestion(qId, ethers.id("ep1"), 3, lockTime);
      await time.increase(20);

      let reverted = false;
      try { await engine.connect(user1).predict(qId, 1, ethers.parseEther("100"), false); } catch { reverted = true; }
      expect(reverted).to.be.true;
    });

    it("should reject duplicate prediction from same user", async function () {
      const { engine, resolver, user1 } = await loadFixture(deployFixture);
      const qId = ethers.id("q1");
      const lockTime = (await time.latest()) + 3600;

      await engine.connect(resolver).createQuestion(qId, ethers.id("ep1"), 3, lockTime);
      await engine.connect(user1).predict(qId, 1, ethers.parseEther("100"), false);

      let reverted = false;
      try { await engine.connect(user1).predict(qId, 2, ethers.parseEther("50"), false); } catch { reverted = true; }
      expect(reverted).to.be.true;
    });
  });

  describe("Resolution and Claims", function () {
    it("should resolve and let winner claim proportional payout", async function () {
      const { token, engine, resolver, user1, user2, treasuryAddr } = await loadFixture(deployFixture);
      const qId = ethers.id("q1");
      const lockTime = (await time.latest()) + 3600;

      await engine.connect(resolver).createQuestion(qId, ethers.id("ep1"), 2, lockTime);

      // User1 bets 200 on option 1 (correct)
      await engine.connect(user1).predict(qId, 1, ethers.parseEther("200"), false);
      // User2 bets 300 on option 2 (incorrect)
      await engine.connect(user2).predict(qId, 2, ethers.parseEther("300"), false);

      const treasuryBefore = await token.balanceOf(treasuryAddr.address);

      // Resolve: option 1 is correct
      await engine.connect(resolver).resolve(qId, 1);

      // Check treasury got 3% fee: 500 * 0.03 = 15
      const treasuryAfter = await token.balanceOf(treasuryAddr.address);
      expect(treasuryAfter - treasuryBefore).to.equal(ethers.parseEther("15"));

      // User1 claims: their share of 97% pool = (200/200) * 485 = 485
      const user1Before = await token.balanceOf(user1.address);
      await engine.connect(user1).claim(qId);
      const user1After = await token.balanceOf(user1.address);
      expect(user1After - user1Before).to.equal(ethers.parseEther("485"));
    });

    it("should give loser nothing without joker", async function () {
      const { engine, resolver, user1, user2 } = await loadFixture(deployFixture);
      const qId = ethers.id("q1");
      const lockTime = (await time.latest()) + 3600;

      await engine.connect(resolver).createQuestion(qId, ethers.id("ep1"), 2, lockTime);
      await engine.connect(user1).predict(qId, 1, ethers.parseEther("100"), false);
      await engine.connect(user2).predict(qId, 2, ethers.parseEther("100"), false);

      await engine.connect(resolver).resolve(qId, 1);

      // User2 (loser) claims - payout should be 0
      const payout = await engine.calculatePayout(qId, user2.address);
      expect(payout).to.equal(0n);
    });

    it("should refund stake with joker on wrong prediction", async function () {
      const { token, engine, resolver, user1, user2 } = await loadFixture(deployFixture);
      const qId = ethers.id("q1");
      const seasonId = ethers.id("season1");
      const lockTime = (await time.latest()) + 3600;

      await engine.connect(resolver).createQuestion(qId, ethers.id("ep1"), 2, lockTime);

      // User1 predicts wrong option
      await engine.connect(user1).predict(qId, 2, ethers.parseEther("100"), false);
      // User2 predicts correct
      await engine.connect(user2).predict(qId, 1, ethers.parseEther("100"), false);

      // Grant joker to user1 and use it
      await engine.connect(resolver).grantJokers(user1.address, seasonId, 1);
      await engine.connect(user1).useJoker(qId, seasonId);

      // Resolve: option 1 correct
      await engine.connect(resolver).resolve(qId, 1);

      // User1 should get stake back (100)
      const payout = await engine.calculatePayout(qId, user1.address);
      expect(payout).to.equal(ethers.parseEther("100"));
    });

    it("should not allow double claim", async function () {
      const { engine, resolver, user1 } = await loadFixture(deployFixture);
      const qId = ethers.id("q1");
      const lockTime = (await time.latest()) + 3600;

      await engine.connect(resolver).createQuestion(qId, ethers.id("ep1"), 2, lockTime);
      await engine.connect(user1).predict(qId, 1, ethers.parseEther("100"), false);
      await engine.connect(resolver).resolve(qId, 1);

      await engine.connect(user1).claim(qId);

      let reverted = false;
      try { await engine.connect(user1).claim(qId); } catch { reverted = true; }
      expect(reverted).to.be.true;
    });
  });

  describe("Risk Bets", function () {
    it("should give 1.5x effective stake on correct risk bet", async function () {
      const { engine, resolver, user1, user2 } = await loadFixture(deployFixture);
      const qId = ethers.id("q1");
      const lockTime = (await time.latest()) + 3600;

      await engine.connect(resolver).createQuestion(qId, ethers.id("ep1"), 2, lockTime);

      // User1: risk bet 100 on option 1
      await engine.connect(user1).predict(qId, 1, ethers.parseEther("100"), true);
      // User2: normal bet 100 on option 2
      await engine.connect(user2).predict(qId, 2, ethers.parseEther("100"), false);

      await engine.connect(resolver).resolve(qId, 1);

      // User1 payout with 1.5x effective stake
      const payout = await engine.calculatePayout(qId, user1.address);
      // Pool = 200, netPool = 194, user1 effective = 150, correctStakes = 100
      // payout = (150/100) * 194 = 291 (capped at netPool 194)
      expect(payout).to.equal(ethers.parseEther("194"));
    });
  });
});
