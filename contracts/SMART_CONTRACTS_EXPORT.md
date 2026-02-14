# RealityPicks Smart Contracts — Full Export

**Chain**: Base (EVM, Chain ID 8453)
**Solidity**: 0.8.24
**Framework**: Hardhat
**Dependencies**: OpenZeppelin Contracts v5.1

## Deployed Addresses (Base Mainnet)

| Contract          | Address                                      |
|-------------------|----------------------------------------------|
| PicksToken        | `0x5294199EB963B6b868609B324D540B79BFbafB07` |
| Treasury          | `0x5bA7Bc0Bfe44DB1AE8D81c09b7FB356f656EAC7d` |
| PredictionEngine  | `0x3599A6B2dCEde53606EBb126f563D5708399d451` |
| StakingVault      | `0x25Bd8674F137f8B5f14808A9034D1d8644A39612` |
| BadgeNFT          | `0x0EEee99420686733063E4fE83E504c8929e16626` |
| SeasonPass        | `0x938B88628Cfcffe230D58a1EC1CC81D04d8eF965` |
| RealityPicksNFT   | `0x88d614173Af60f9295422110bd925fA9e15F32B3` |

Deployer: `0x502ce9FB1814cb03843967EC5E0D8F6AA3A3C2e1`

---

## Architecture Overview

```
PicksToken (ERC-20)
  |
  +-- PredictionEngine (parimutuel predictions, 3% fee to Treasury)
  |     |-- Users stake $PICKS on episode questions
  |     |-- Admin resolves outcomes, winners claim proportional payouts
  |     |-- Joker system for safety nets
  |
  +-- StakingVault (stake $PICKS for tier boosts)
  |     |-- Bronze: 1K / 7d  -> 1.1x
  |     |-- Silver: 10K / 30d -> 1.25x
  |     |-- Gold:   100K / 90d -> 1.5x
  |
  +-- Treasury (fee collection, buyback & burn, timelocked withdrawals)
  |
  +-- BadgeNFT (ERC-1155, soulbound achievement badges)
  |
  +-- SeasonPass (ERC-721, burn $PICKS to purchase, bonding curve pricing)
  |
  +-- RealityPicksNFT (ERC-721, 5-tier collection)
  |     |-- Tier 0: Early Supporter (1,111 max, open mint)
  |     |-- Tier 1: Player (3,000 max, signature-gated)
  |     |-- Tier 2: Community OG (1,000 max, signature-gated)
  |     |-- Tier 3: Survivor Pro (500 max, signature-gated)
  |     |-- Tier 4: Legend (111 max, signature-gated, soulbound)
  |     |-- Revenue: 75% liquidity / 25% treasury
  |
  +-- BondingCurvePresale (OPTIONAL, only for custom deploy path)
```

---

## Contract Source Files

### 1. PicksToken.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PicksToken
 * @notice OPTIONAL when using Clanker deployment path.
 *         If deploying via Clanker (clanker.world), Clanker creates the ERC-20 token
 *         automatically with Uniswap V4 LP. Use this contract only for the
 *         custom deployment path (deploy.ts).
 * @notice $PICKS - The utility token for SurvivorPicks prediction market on Base
 * @dev Fixed supply of 1 billion tokens, minted at deployment and distributed to allocation wallets.
 *      Supports burning for deflationary mechanics (season passes, buybacks).
 *      Uses ERC20Permit for gasless approvals.
 */
contract PicksToken is ERC20, ERC20Burnable, ERC20Permit, Ownable {
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 1e18; // 1 billion tokens

    // Allocation percentages (basis points, 10000 = 100%)
    uint256 public constant COMMUNITY_REWARDS_BPS = 4000;  // 40%
    uint256 public constant LIQUIDITY_BPS = 2000;           // 20%
    uint256 public constant TEAM_BPS = 1500;                // 15%
    uint256 public constant PRESALE_BPS = 1000;             // 10%
    uint256 public constant STAKING_REWARDS_BPS = 1000;     // 10%
    uint256 public constant ECOSYSTEM_BPS = 500;            // 5%

    address public immutable communityRewardsWallet;
    address public immutable liquidityWallet;
    address public immutable teamWallet;
    address public immutable presaleWallet;
    address public immutable stakingRewardsWallet;
    address public immutable ecosystemWallet;

    event TokensDistributed(
        address communityRewards,
        address liquidity,
        address team,
        address presale,
        address stakingRewards,
        address ecosystem
    );

    constructor(
        address _communityRewards,
        address _liquidity,
        address _team,
        address _presale,
        address _stakingRewards,
        address _ecosystem
    ) ERC20("SurvivorPicks", "PICKS") ERC20Permit("SurvivorPicks") Ownable(msg.sender) {
        require(_communityRewards != address(0), "Zero address: communityRewards");
        require(_liquidity != address(0), "Zero address: liquidity");
        require(_team != address(0), "Zero address: team");
        require(_presale != address(0), "Zero address: presale");
        require(_stakingRewards != address(0), "Zero address: stakingRewards");
        require(_ecosystem != address(0), "Zero address: ecosystem");

        communityRewardsWallet = _communityRewards;
        liquidityWallet = _liquidity;
        teamWallet = _team;
        presaleWallet = _presale;
        stakingRewardsWallet = _stakingRewards;
        ecosystemWallet = _ecosystem;

        _mint(_communityRewards, (TOTAL_SUPPLY * COMMUNITY_REWARDS_BPS) / 10000);
        _mint(_liquidity, (TOTAL_SUPPLY * LIQUIDITY_BPS) / 10000);
        _mint(_team, (TOTAL_SUPPLY * TEAM_BPS) / 10000);
        _mint(_presale, (TOTAL_SUPPLY * PRESALE_BPS) / 10000);
        _mint(_stakingRewards, (TOTAL_SUPPLY * STAKING_REWARDS_BPS) / 10000);
        _mint(_ecosystem, (TOTAL_SUPPLY * ECOSYSTEM_BPS) / 10000);

        emit TokensDistributed(
            _communityRewards, _liquidity, _team, _presale, _stakingRewards, _ecosystem
        );
    }
}
```

---

### 2. PredictionEngine.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PredictionEngine
 * @notice Core prediction market contract for SurvivorPicks on Base.
 *         Users stake $PICKS tokens on episode questions, admin resolves outcomes,
 *         and winners claim proportional payouts (parimutuel style) minus a 3% platform fee.
 */
contract PredictionEngine is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant RESOLVER_ROLE = keccak256("RESOLVER_ROLE");

    uint256 public constant PLATFORM_FEE_BPS = 300; // 3%
    uint256 public constant BPS_DENOMINATOR = 10000;
    uint256 public constant RISK_MULTIPLIER_BPS = 15000; // 1.5x
    uint8 public constant MAX_OPTIONS = 8;

    IERC20 public immutable picksToken;
    address public treasury;

    struct Question {
        bytes32 episodeId;
        uint256 lockTimestamp;
        uint8 optionCount;
        uint8 correctOption;
        bool resolved;
        uint256 totalStaked;
        uint256[8] optionStakes;
    }

    struct UserPrediction {
        uint8 option;
        uint256 amount;
        bool isRisk;
        bool claimed;
    }

    mapping(bytes32 => Question) public questions;
    mapping(bytes32 => mapping(address => UserPrediction)) public predictions;
    mapping(address => mapping(bytes32 => uint8)) public jokersRemaining;
    mapping(address => mapping(bytes32 => bool)) public jokerUsed;
    bytes32[] public questionIds;

    event QuestionCreated(bytes32 indexed questionId, bytes32 indexed episodeId, uint8 optionCount, uint256 lockTimestamp);
    event PredictionMade(bytes32 indexed questionId, address indexed user, uint8 option, uint256 amount, bool isRisk);
    event QuestionResolved(bytes32 indexed questionId, uint8 correctOption, uint256 totalPool, uint256 platformFee);
    event RewardClaimed(bytes32 indexed questionId, address indexed user, uint256 amount);
    event JokerRefund(bytes32 indexed questionId, address indexed user, uint256 amount);
    event TreasuryUpdated(address oldTreasury, address newTreasury);

    constructor(address _picksToken, address _treasury) {
        require(_picksToken != address(0), "Zero token address");
        require(_treasury != address(0), "Zero treasury address");
        picksToken = IERC20(_picksToken);
        treasury = _treasury;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(RESOLVER_ROLE, msg.sender);
    }

    function createQuestion(bytes32 questionId, bytes32 episodeId, uint8 optionCount, uint256 lockTimestamp) external onlyRole(RESOLVER_ROLE) {
        require(questions[questionId].optionCount == 0, "Question exists");
        require(optionCount >= 2 && optionCount <= MAX_OPTIONS, "Invalid option count");
        require(lockTimestamp > block.timestamp, "Lock must be in future");
        questions[questionId] = Question({
            episodeId: episodeId, lockTimestamp: lockTimestamp, optionCount: optionCount,
            correctOption: 0, resolved: false, totalStaked: 0,
            optionStakes: [uint256(0), 0, 0, 0, 0, 0, 0, 0]
        });
        questionIds.push(questionId);
        emit QuestionCreated(questionId, episodeId, optionCount, lockTimestamp);
    }

    function resolve(bytes32 questionId, uint8 correctOption) external onlyRole(RESOLVER_ROLE) {
        Question storage q = questions[questionId];
        require(q.optionCount > 0, "Question not found");
        require(!q.resolved, "Already resolved");
        require(correctOption >= 1 && correctOption <= q.optionCount, "Invalid option");
        q.correctOption = correctOption;
        q.resolved = true;
        uint256 platformFee = (q.totalStaked * PLATFORM_FEE_BPS) / BPS_DENOMINATOR;
        if (platformFee > 0) { picksToken.safeTransfer(treasury, platformFee); }
        emit QuestionResolved(questionId, correctOption, q.totalStaked, platformFee);
    }

    function setTreasury(address _treasury) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_treasury != address(0), "Zero address");
        address old = treasury;
        treasury = _treasury;
        emit TreasuryUpdated(old, _treasury);
    }

    function grantJokers(address user, bytes32 seasonId, uint8 count) external onlyRole(RESOLVER_ROLE) {
        jokersRemaining[user][seasonId] = count;
    }

    function predict(bytes32 questionId, uint8 option, uint256 amount, bool isRisk) external nonReentrant {
        Question storage q = questions[questionId];
        require(q.optionCount > 0, "Question not found");
        require(!q.resolved, "Already resolved");
        require(block.timestamp < q.lockTimestamp, "Predictions locked");
        require(option >= 1 && option <= q.optionCount, "Invalid option");
        require(amount > 0, "Zero amount");
        require(predictions[questionId][msg.sender].amount == 0, "Already predicted");
        picksToken.safeTransferFrom(msg.sender, address(this), amount);
        predictions[questionId][msg.sender] = UserPrediction({ option: option, amount: amount, isRisk: isRisk, claimed: false });
        q.totalStaked += amount;
        q.optionStakes[option - 1] += amount;
        emit PredictionMade(questionId, msg.sender, option, amount, isRisk);
    }

    function useJoker(bytes32 questionId, bytes32 seasonId) external {
        require(predictions[questionId][msg.sender].amount > 0, "No prediction");
        require(!questions[questionId].resolved, "Already resolved");
        require(!predictions[questionId][msg.sender].isRisk, "Cannot joker risk bets");
        require(jokersRemaining[msg.sender][seasonId] > 0, "No jokers left");
        require(!jokerUsed[msg.sender][questionId], "Joker already used");
        jokerUsed[msg.sender][questionId] = true;
        jokersRemaining[msg.sender][seasonId]--;
    }

    function claim(bytes32 questionId) external nonReentrant {
        Question storage q = questions[questionId];
        require(q.resolved, "Not resolved");
        UserPrediction storage pred = predictions[questionId][msg.sender];
        require(pred.amount > 0, "No prediction");
        require(!pred.claimed, "Already claimed");
        pred.claimed = true;
        uint256 payout = _calculatePayout(questionId, msg.sender);
        if (payout > 0) {
            picksToken.safeTransfer(msg.sender, payout);
            if (pred.option != q.correctOption && jokerUsed[msg.sender][questionId]) {
                emit JokerRefund(questionId, msg.sender, payout);
            } else {
                emit RewardClaimed(questionId, msg.sender, payout);
            }
        }
    }

    function getQuestion(bytes32 questionId) external view returns (
        bytes32 episodeId, uint256 lockTimestamp, uint8 optionCount, uint8 correctOption,
        bool resolved, uint256 totalStaked, uint256[8] memory optionStakes
    ) {
        Question storage q = questions[questionId];
        return (q.episodeId, q.lockTimestamp, q.optionCount, q.correctOption, q.resolved, q.totalStaked, q.optionStakes);
    }

    function getUserPrediction(bytes32 questionId, address user) external view returns (
        uint8 option, uint256 amount, bool isRisk, bool claimed
    ) {
        UserPrediction storage p = predictions[questionId][user];
        return (p.option, p.amount, p.isRisk, p.claimed);
    }

    function getQuestionCount() external view returns (uint256) { return questionIds.length; }
    function calculatePayout(bytes32 questionId, address user) external view returns (uint256) { return _calculatePayout(questionId, user); }

    function _calculatePayout(bytes32 questionId, address user) internal view returns (uint256) {
        Question storage q = questions[questionId];
        UserPrediction storage pred = predictions[questionId][user];
        if (pred.amount == 0) return 0;
        if (pred.option == q.correctOption) {
            uint256 pool = q.totalStaked;
            uint256 netPool = pool - (pool * PLATFORM_FEE_BPS) / BPS_DENOMINATOR;
            uint256 correctStakes = q.optionStakes[q.correctOption - 1];
            if (correctStakes == 0) return 0;
            uint256 effectiveStake = pred.amount;
            if (pred.isRisk) { effectiveStake = (pred.amount * RISK_MULTIPLIER_BPS) / BPS_DENOMINATOR; }
            uint256 effectiveCorrectStakes = correctStakes;
            uint256 payout = (effectiveStake * netPool) / effectiveCorrectStakes;
            if (payout > netPool) payout = netPool;
            return payout;
        }
        if (jokerUsed[user][questionId]) { return pred.amount; }
        return 0;
    }
}
```

---

### 3. StakingVault.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title StakingVault
 * @notice Stake $PICKS to earn boosted prediction multipliers and staking rewards.
 *         Tiers: Bronze (1k/7d -> 1.1x), Silver (10k/30d -> 1.25x), Gold (100k/90d -> 1.5x)
 */
contract StakingVault is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    IERC20 public immutable picksToken;

    uint256 public constant BRONZE_MIN = 1_000 * 1e18;
    uint256 public constant SILVER_MIN = 10_000 * 1e18;
    uint256 public constant GOLD_MIN = 100_000 * 1e18;
    uint256 public constant BRONZE_DURATION = 7 days;
    uint256 public constant SILVER_DURATION = 30 days;
    uint256 public constant GOLD_DURATION = 90 days;
    uint256 public constant BRONZE_BOOST_BPS = 11000;
    uint256 public constant SILVER_BOOST_BPS = 12500;
    uint256 public constant GOLD_BOOST_BPS = 15000;
    uint256 public constant NO_BOOST_BPS = 10000;

    uint256 public rewardRate;
    uint256 public lastUpdateTime;
    uint256 public rewardPerTokenStored;
    uint256 public totalStaked;
    uint256 public rewardEndTime;

    struct StakeInfo { uint256 amount; uint256 stakedAt; uint256 rewardPerTokenPaid; uint256 rewards; }
    mapping(address => StakeInfo) public stakes;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);
    event RewardRateUpdated(uint256 newRate, uint256 endTime);

    constructor(address _picksToken) Ownable(msg.sender) {
        require(_picksToken != address(0), "Zero token address");
        picksToken = IERC20(_picksToken);
    }

    function setRewardRate(uint256 _rewardRate, uint256 _duration) external onlyOwner {
        _updateReward(address(0));
        rewardRate = _rewardRate;
        rewardEndTime = block.timestamp + _duration;
        lastUpdateTime = block.timestamp;
        emit RewardRateUpdated(_rewardRate, rewardEndTime);
    }

    function stake(uint256 amount) external nonReentrant {
        require(amount > 0, "Zero amount");
        _updateReward(msg.sender);
        picksToken.safeTransferFrom(msg.sender, address(this), amount);
        StakeInfo storage s = stakes[msg.sender];
        if (s.amount == 0) { s.stakedAt = block.timestamp; }
        s.amount += amount;
        totalStaked += amount;
        emit Staked(msg.sender, amount);
    }

    function unstake(uint256 amount) external nonReentrant {
        StakeInfo storage s = stakes[msg.sender];
        require(s.amount >= amount, "Insufficient stake");
        require(amount > 0, "Zero amount");
        _updateReward(msg.sender);
        s.amount -= amount;
        totalStaked -= amount;
        if (s.amount == 0) { s.stakedAt = 0; }
        picksToken.safeTransfer(msg.sender, amount);
        emit Unstaked(msg.sender, amount);
    }

    function claimRewards() external nonReentrant {
        _updateReward(msg.sender);
        StakeInfo storage s = stakes[msg.sender];
        uint256 reward = s.rewards;
        require(reward > 0, "No rewards");
        s.rewards = 0;
        picksToken.safeTransfer(msg.sender, reward);
        emit RewardsClaimed(msg.sender, reward);
    }

    function getUserTier(address user) external view returns (uint8 tier) {
        StakeInfo storage s = stakes[user];
        if (s.amount == 0) return 0;
        uint256 duration = block.timestamp - s.stakedAt;
        if (s.amount >= GOLD_MIN && duration >= GOLD_DURATION) return 3;
        if (s.amount >= SILVER_MIN && duration >= SILVER_DURATION) return 2;
        if (s.amount >= BRONZE_MIN && duration >= BRONZE_DURATION) return 1;
        return 0;
    }

    function getBoostBPS(address user) external view returns (uint256) {
        StakeInfo storage s = stakes[user];
        if (s.amount == 0) return NO_BOOST_BPS;
        uint256 duration = block.timestamp - s.stakedAt;
        if (s.amount >= GOLD_MIN && duration >= GOLD_DURATION) return GOLD_BOOST_BPS;
        if (s.amount >= SILVER_MIN && duration >= SILVER_DURATION) return SILVER_BOOST_BPS;
        if (s.amount >= BRONZE_MIN && duration >= BRONZE_DURATION) return BRONZE_BOOST_BPS;
        return NO_BOOST_BPS;
    }

    function pendingRewards(address user) external view returns (uint256) {
        StakeInfo storage s = stakes[user];
        uint256 currentRewardPerToken = rewardPerTokenStored;
        if (totalStaked > 0) {
            uint256 timeElapsed = _min(block.timestamp, rewardEndTime) - lastUpdateTime;
            currentRewardPerToken += (timeElapsed * rewardRate * 1e18) / totalStaked;
        }
        return s.rewards + (s.amount * (currentRewardPerToken - s.rewardPerTokenPaid)) / 1e18;
    }

    function getStakeInfo(address user) external view returns (uint256 amount, uint256 stakedAt, uint256 rewards) {
        StakeInfo storage s = stakes[user];
        return (s.amount, s.stakedAt, s.rewards);
    }

    function _updateReward(address user) internal {
        if (totalStaked > 0) {
            uint256 end = _min(block.timestamp, rewardEndTime);
            if (end > lastUpdateTime) {
                uint256 timeElapsed = end - lastUpdateTime;
                rewardPerTokenStored += (timeElapsed * rewardRate * 1e18) / totalStaked;
            }
        }
        lastUpdateTime = _min(block.timestamp, rewardEndTime);
        if (user != address(0)) {
            StakeInfo storage s = stakes[user];
            s.rewards += (s.amount * (rewardPerTokenStored - s.rewardPerTokenPaid)) / 1e18;
            s.rewardPerTokenPaid = rewardPerTokenStored;
        }
    }

    function _min(uint256 a, uint256 b) internal pure returns (uint256) { return a < b ? a : b; }
}
```

---

### 4. Treasury.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title Treasury
 * @notice Collects platform fees from predictions and NFT royalties.
 *         Supports buyback + burn for deflationary pressure and timelocked team withdrawals.
 */
contract Treasury is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    ERC20Burnable public immutable picksToken;
    uint256 public constant WITHDRAWAL_COOLDOWN = 7 days;
    uint256 public constant MAX_WITHDRAWAL_BPS = 1000;
    uint256 public lastWithdrawTime;
    uint256 public totalBurned;
    uint256 public totalWithdrawn;

    struct PendingWithdrawal { address to; uint256 amount; uint256 executeAfter; bool executed; }
    PendingWithdrawal[] public pendingWithdrawals;

    event FeeReceived(address indexed from, uint256 amount);
    event BuybackAndBurn(uint256 amount);
    event WithdrawalQueued(uint256 indexed id, address to, uint256 amount, uint256 executeAfter);
    event WithdrawalExecuted(uint256 indexed id, address to, uint256 amount);
    event WithdrawalCancelled(uint256 indexed id);
    event ETHWithdrawn(address to, uint256 amount);

    constructor(address _picksToken) Ownable(msg.sender) {
        require(_picksToken != address(0), "Zero token");
        picksToken = ERC20Burnable(_picksToken);
    }

    receive() external payable { emit FeeReceived(msg.sender, msg.value); }

    function buybackAndBurn(uint256 amount) external onlyOwner nonReentrant {
        require(amount > 0, "Zero amount");
        uint256 balance = picksToken.balanceOf(address(this));
        require(balance >= amount, "Insufficient balance");
        picksToken.burn(amount);
        totalBurned += amount;
        emit BuybackAndBurn(amount);
    }

    function queueWithdrawal(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Zero address");
        require(amount > 0, "Zero amount");
        uint256 balance = picksToken.balanceOf(address(this));
        uint256 maxAmount = (balance * MAX_WITHDRAWAL_BPS) / 10000;
        require(amount <= maxAmount, "Exceeds 10% cap");
        uint256 executeAfter = block.timestamp + WITHDRAWAL_COOLDOWN;
        pendingWithdrawals.push(PendingWithdrawal({ to: to, amount: amount, executeAfter: executeAfter, executed: false }));
        emit WithdrawalQueued(pendingWithdrawals.length - 1, to, amount, executeAfter);
    }

    function executeWithdrawal(uint256 id) external onlyOwner nonReentrant {
        require(id < pendingWithdrawals.length, "Invalid ID");
        PendingWithdrawal storage w = pendingWithdrawals[id];
        require(!w.executed, "Already executed");
        require(block.timestamp >= w.executeAfter, "Timelock not expired");
        w.executed = true;
        totalWithdrawn += w.amount;
        IERC20(address(picksToken)).transfer(w.to, w.amount);
        emit WithdrawalExecuted(id, w.to, w.amount);
    }

    function cancelWithdrawal(uint256 id) external onlyOwner {
        require(id < pendingWithdrawals.length, "Invalid ID");
        PendingWithdrawal storage w = pendingWithdrawals[id];
        require(!w.executed, "Already executed");
        w.executed = true;
        emit WithdrawalCancelled(id);
    }

    function withdrawETH(address payable to, uint256 amount) external onlyOwner nonReentrant {
        require(to != address(0), "Zero address");
        require(amount <= address(this).balance, "Insufficient ETH");
        (bool success, ) = to.call{value: amount}("");
        require(success, "ETH transfer failed");
        emit ETHWithdrawn(to, amount);
    }

    function treasuryBalance() external view returns (uint256) { return picksToken.balanceOf(address(this)); }
    function ethBalance() external view returns (uint256) { return address(this).balance; }
    function pendingWithdrawalCount() external view returns (uint256) { return pendingWithdrawals.length; }
}
```

---

### 5. BadgeNFT.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title BadgeNFT
 * @notice ERC-1155 achievement badges. Soulbound core badges, tradeable seasonal badges with 5% royalty.
 */
contract BadgeNFT is ERC1155, AccessControl {
    using Strings for uint256;
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    string public name = "SurvivorPicks Badges";
    string public symbol = "SPBADGE";

    mapping(uint256 => bool) public isSoulbound;
    mapping(uint256 => bool) public badgeExists;
    mapping(uint256 => string) private _tokenURIs;
    address public royaltyReceiver;
    uint96 public constant ROYALTY_BPS = 500;
    mapping(address => uint256[]) private _userBadges;
    mapping(address => mapping(uint256 => bool)) public hasBadge;

    event BadgeCreated(uint256 indexed tokenId, bool soulbound, string uri);
    event BadgeMinted(uint256 indexed tokenId, address indexed to);

    constructor(string memory baseUri, address _royaltyReceiver) ERC1155(baseUri) {
        require(_royaltyReceiver != address(0), "Zero royalty receiver");
        royaltyReceiver = _royaltyReceiver;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    function createBadge(uint256 tokenId, bool soulbound, string calldata tokenUri) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(!badgeExists[tokenId], "Badge exists");
        badgeExists[tokenId] = true;
        isSoulbound[tokenId] = soulbound;
        _tokenURIs[tokenId] = tokenUri;
        emit BadgeCreated(tokenId, soulbound, tokenUri);
    }

    function mint(address to, uint256 tokenId) external onlyRole(MINTER_ROLE) {
        require(badgeExists[tokenId], "Badge not found");
        require(!hasBadge[to][tokenId], "Already has badge");
        _mint(to, tokenId, 1, "");
        hasBadge[to][tokenId] = true;
        _userBadges[to].push(tokenId);
        emit BadgeMinted(tokenId, to);
    }

    function mintBatch(address to, uint256[] calldata tokenIds) external onlyRole(MINTER_ROLE) {
        uint256[] memory amounts = new uint256[](tokenIds.length);
        for (uint256 i = 0; i < tokenIds.length; i++) {
            require(badgeExists[tokenIds[i]], "Badge not found");
            require(!hasBadge[to][tokenIds[i]], "Already has badge");
            amounts[i] = 1;
            hasBadge[to][tokenIds[i]] = true;
            _userBadges[to].push(tokenIds[i]);
        }
        _mintBatch(to, tokenIds, amounts, "");
    }

    function setRoyaltyReceiver(address _receiver) external onlyRole(DEFAULT_ADMIN_ROLE) { require(_receiver != address(0)); royaltyReceiver = _receiver; }
    function setBaseURI(string calldata newUri) external onlyRole(DEFAULT_ADMIN_ROLE) { _setURI(newUri); }

    function uri(uint256 tokenId) public view override returns (string memory) {
        string memory tokenUri = _tokenURIs[tokenId];
        if (bytes(tokenUri).length > 0) return tokenUri;
        return string(abi.encodePacked(super.uri(tokenId), tokenId.toString()));
    }

    function getUserBadges(address user) external view returns (uint256[] memory) { return _userBadges[user]; }
    function royaltyInfo(uint256, uint256 salePrice) external view returns (address, uint256) { return (royaltyReceiver, (salePrice * ROYALTY_BPS) / 10000); }

    function _update(address from, address to, uint256[] memory ids, uint256[] memory values) internal override {
        if (from != address(0) && to != address(0)) {
            for (uint256 i = 0; i < ids.length; i++) { require(!isSoulbound[ids[i]], "Soulbound: non-transferable"); }
        }
        super._update(from, to, ids, values);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC1155, AccessControl) returns (bool) {
        return interfaceId == 0x2a55205a || super.supportsInterface(interfaceId);
    }
}
```

---

### 6. SeasonPass.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SeasonPass
 * @notice Premium Season Pass NFT (ERC-721). Purchased by burning $PICKS tokens.
 *         Limited supply, bonding curve pricing, grants boosted rewards.
 */
contract SeasonPass is ERC721, ERC721Enumerable, Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    ERC20Burnable public immutable picksToken;
    uint256 public maxSupply;
    uint256 public nextTokenId = 1;
    string public baseTokenURI;
    uint256 public basePrice;
    uint256 public priceIncrement;
    bytes32 public seasonId;
    bool public saleActive;
    mapping(uint256 => bytes32) public passSeasonId;

    event PassPurchased(address indexed buyer, uint256 indexed tokenId, uint256 price, uint256 tokensBurned);
    event SaleToggled(bool active);
    event SeasonConfigured(bytes32 seasonId, uint256 maxSupply, uint256 basePrice, uint256 priceIncrement);

    constructor(address _picksToken, string memory _name, string memory _symbol) ERC721(_name, _symbol) Ownable(msg.sender) {
        require(_picksToken != address(0), "Zero token");
        picksToken = ERC20Burnable(_picksToken);
    }

    function configureSeason(bytes32 _seasonId, uint256 _maxSupply, uint256 _basePrice, uint256 _priceIncrement) external onlyOwner {
        require(_maxSupply > 0 && _basePrice > 0);
        seasonId = _seasonId; maxSupply = _maxSupply; basePrice = _basePrice; priceIncrement = _priceIncrement; nextTokenId = 1;
        emit SeasonConfigured(_seasonId, _maxSupply, _basePrice, _priceIncrement);
    }
    function toggleSale() external onlyOwner { saleActive = !saleActive; emit SaleToggled(saleActive); }
    function setBaseURI(string calldata _uri) external onlyOwner { baseTokenURI = _uri; }

    function purchase() external nonReentrant {
        require(saleActive, "Sale not active");
        require(nextTokenId <= maxSupply, "Sold out");
        uint256 price = currentPrice();
        IERC20(address(picksToken)).transferFrom(msg.sender, address(this), price);
        picksToken.burn(price);
        uint256 tokenId = nextTokenId++;
        _safeMint(msg.sender, tokenId);
        passSeasonId[tokenId] = seasonId;
        emit PassPurchased(msg.sender, tokenId, price, price);
    }

    function currentPrice() public view returns (uint256) { return basePrice + (priceIncrement * (nextTokenId - 1)); }
    function hasActivePass(address user) external view returns (bool) {
        uint256 balance = balanceOf(user);
        for (uint256 i = 0; i < balance; i++) { if (passSeasonId[tokenOfOwnerByIndex(user, i)] == seasonId) return true; }
        return false;
    }
    function remainingSupply() external view returns (uint256) { return nextTokenId > maxSupply ? 0 : maxSupply - nextTokenId + 1; }
    function _baseURI() internal view override returns (string memory) { return baseTokenURI; }
    function _update(address to, uint256 tokenId, address auth) internal override(ERC721, ERC721Enumerable) returns (address) { return super._update(to, tokenId, auth); }
    function _increaseBalance(address account, uint128 value) internal override(ERC721, ERC721Enumerable) { super._increaseBalance(account, value); }
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable) returns (bool) { return super.supportsInterface(interfaceId); }
}
```

---

### 7. RealityPicksNFT.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/**
 * @title RealityPicksNFT
 * @notice Tiered ERC-721 collection for RealityPicks on Base.
 *  5 Tiers:
 *    0 - Early Supporter  (1,111 max, 0.000111 ETH, open mint)
 *    1 - Player            (3,000 max, 0.00111 ETH,  signature-gated)
 *    2 - Community OG      (1,000 max, 0.00333 ETH,  signature-gated)
 *    3 - Survivor Pro      (  500 max, 0.00888 ETH,  signature-gated)
 *    4 - Legend            (  111 max, 0.0111 ETH,   signature-gated, soulbound)
 *  Revenue split: 75% liquidity, 25% treasury. Royalties: 5% (EIP-2981).
 */
contract RealityPicksNFT is ERC721, ERC721Enumerable, Ownable, ReentrancyGuard {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    struct Tier { uint256 maxSupply; uint256 minted; uint256 price; bool active; bool soulbound; bool requireSig; string name; }
    uint256 public constant NUM_TIERS = 5;
    mapping(uint256 => Tier) public tiers;
    mapping(uint256 => uint256) public tokenTier;
    mapping(address => mapping(uint256 => bool)) public hasMintedTier;
    uint256 private _nextTokenId = 1;

    address payable public liquidityReceiver;
    address payable public treasuryReceiver;
    uint256 public constant LIQUIDITY_BPS = 7500;
    uint256 public constant TREASURY_BPS  = 2500;
    address public trustedSigner;
    mapping(address => uint256) public sigNonces;
    uint96 public constant ROYALTY_BPS = 500;
    string private _baseTokenURI;

    event Minted(address indexed to, uint256 indexed tokenId, uint256 indexed tierId);
    event TierToggled(uint256 indexed tierId, bool active);
    event RevenueDistributed(uint256 liquidityAmount, uint256 treasuryAmount);
    event TrustedSignerUpdated(address newSigner);

    constructor(string memory baseURI, address payable _treasuryReceiver, address payable _liquidityReceiver, address _trustedSigner)
        ERC721("RealityPicks Collection", "RPNFT") Ownable(msg.sender)
    {
        require(_treasuryReceiver != address(0) && _liquidityReceiver != address(0) && _trustedSigner != address(0));
        _baseTokenURI = baseURI;
        treasuryReceiver = _treasuryReceiver;
        liquidityReceiver = _liquidityReceiver;
        trustedSigner = _trustedSigner;

        tiers[0] = Tier({ maxSupply: 1111, minted: 0, price: 0.000111 ether, active: true, soulbound: false, requireSig: false, name: "Early Supporter" });
        tiers[1] = Tier({ maxSupply: 3000, minted: 0, price: 0.00111 ether, active: false, soulbound: false, requireSig: true, name: "Player" });
        tiers[2] = Tier({ maxSupply: 1000, minted: 0, price: 0.00333 ether, active: false, soulbound: false, requireSig: true, name: "Community OG" });
        tiers[3] = Tier({ maxSupply: 500, minted: 0, price: 0.00888 ether, active: false, soulbound: false, requireSig: true, name: "Survivor Pro" });
        tiers[4] = Tier({ maxSupply: 111, minted: 0, price: 0.0111 ether, active: false, soulbound: true, requireSig: true, name: "Legend" });
    }

    function mint(uint256 tierId) external payable nonReentrant {
        Tier storage tier = tiers[tierId];
        require(tierId < NUM_TIERS && tier.active && !tier.requireSig, "Invalid/inactive/sig-required");
        require(!hasMintedTier[msg.sender][tierId] && tier.minted < tier.maxSupply && msg.value == tier.price);
        _mintInternal(msg.sender, tierId);
        _distributeRevenue(msg.value);
    }

    function mintWithSignature(uint256 tierId, bytes calldata signature) external payable nonReentrant {
        Tier storage tier = tiers[tierId];
        require(tierId < NUM_TIERS && tier.active && tier.requireSig);
        require(!hasMintedTier[msg.sender][tierId] && tier.minted < tier.maxSupply && msg.value == tier.price);
        uint256 nonce = sigNonces[msg.sender];
        bytes32 messageHash = keccak256(abi.encodePacked(msg.sender, tierId, nonce, block.chainid, address(this)));
        bytes32 ethSignedHash = messageHash.toEthSignedMessageHash();
        require(ethSignedHash.recover(signature) == trustedSigner, "Invalid signature");
        sigNonces[msg.sender]++;
        _mintInternal(msg.sender, tierId);
        _distributeRevenue(msg.value);
    }

    function _mintInternal(address to, uint256 tierId) internal {
        uint256 tokenId = _nextTokenId++;
        tiers[tierId].minted++;
        tokenTier[tokenId] = tierId;
        hasMintedTier[to][tierId] = true;
        _safeMint(to, tokenId);
        emit Minted(to, tokenId, tierId);
    }

    function _distributeRevenue(uint256 amount) internal {
        uint256 liquidityShare = (amount * LIQUIDITY_BPS) / 10000;
        uint256 treasuryShare  = amount - liquidityShare;
        (bool s1,) = liquidityReceiver.call{value: liquidityShare}("");
        require(s1, "Liquidity transfer failed");
        (bool s2,) = treasuryReceiver.call{value: treasuryShare}("");
        require(s2, "Treasury transfer failed");
        emit RevenueDistributed(liquidityShare, treasuryShare);
    }

    function _update(address to, uint256 tokenId, address auth) internal override(ERC721, ERC721Enumerable) returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) { require(!tiers[tokenTier[tokenId]].soulbound, "Soulbound: non-transferable"); }
        return super._update(to, tokenId, auth);
    }
    function _increaseBalance(address account, uint128 value) internal override(ERC721, ERC721Enumerable) { super._increaseBalance(account, value); }

    function toggleTier(uint256 tierId) external onlyOwner { require(tierId < NUM_TIERS); tiers[tierId].active = !tiers[tierId].active; emit TierToggled(tierId, tiers[tierId].active); }
    function setTrustedSigner(address _signer) external onlyOwner { require(_signer != address(0)); trustedSigner = _signer; emit TrustedSignerUpdated(_signer); }
    function setLiquidityReceiver(address payable _receiver) external onlyOwner { require(_receiver != address(0)); liquidityReceiver = _receiver; }
    function setTreasuryReceiver(address payable _receiver) external onlyOwner { require(_receiver != address(0)); treasuryReceiver = _receiver; }
    function setBaseURI(string calldata newBaseURI) external onlyOwner { _baseTokenURI = newBaseURI; }
    function withdrawStuck() external onlyOwner { uint256 bal = address(this).balance; require(bal > 0); (bool ok,) = owner().call{value: bal}(""); require(ok); }

    function getTierInfo(uint256 tierId) external view returns (string memory, uint256, uint256, uint256, uint256, bool, bool, bool) {
        require(tierId < NUM_TIERS);
        Tier storage t = tiers[tierId];
        return (t.name, t.maxSupply, t.minted, t.maxSupply - t.minted, t.price, t.active, t.soulbound, t.requireSig);
    }
    function getUserTiers(address user) external view returns (uint256[] memory) {
        uint256 bal = balanceOf(user);
        uint256[] memory result = new uint256[](bal);
        for (uint256 i = 0; i < bal; i++) { result[i] = tokenTier[tokenOfOwnerByIndex(user, i)]; }
        return result;
    }
    function getNonce(address user) external view returns (uint256) { return sigNonces[user]; }
    function _baseURI() internal view override returns (string memory) { return _baseTokenURI; }
    function royaltyInfo(uint256, uint256 salePrice) external view returns (address, uint256) { return (treasuryReceiver, (salePrice * ROYALTY_BPS) / 10000); }
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable) returns (bool) { return interfaceId == 0x2a55205a || super.supportsInterface(interfaceId); }
}
```

---

### 8. BondingCurvePresale.sol (OPTIONAL)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title BondingCurvePresale
 * @notice OPTIONAL -- only for custom deploy path. Clanker path uses Uniswap V4 LP instead.
 *         Fair linear bonding curve presale. Price = basePrice + (slope * totalSold).
 */
contract BondingCurvePresale is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    IERC20 public immutable picksToken;
    uint256 public basePrice;
    uint256 public slope;
    uint256 public maxTokens;
    uint256 public totalSold;
    uint256 public totalRaised;
    bool public saleActive;
    bool public finalized;
    uint256 public constant MIN_PURCHASE = 100 * 1e18;
    uint256 public constant MAX_PURCHASE = 5_000_000 * 1e18;
    mapping(address => uint256) public purchases;

    event TokensPurchased(address indexed buyer, uint256 amount, uint256 cost, uint256 newPrice);
    event SaleStarted(uint256 basePrice, uint256 slope, uint256 maxTokens);
    event SaleFinalized(uint256 totalSold, uint256 totalRaised);
    event ETHWithdrawn(address to, uint256 amount);

    constructor(address _picksToken) Ownable(msg.sender) { require(_picksToken != address(0)); picksToken = IERC20(_picksToken); }

    function startSale(uint256 _basePrice, uint256 _slope, uint256 _maxTokens) external onlyOwner {
        require(!saleActive && !finalized && _basePrice > 0 && _maxTokens > 0);
        require(picksToken.balanceOf(address(this)) >= _maxTokens);
        basePrice = _basePrice; slope = _slope; maxTokens = _maxTokens; saleActive = true;
        emit SaleStarted(_basePrice, _slope, _maxTokens);
    }

    function finalizeSale() external onlyOwner {
        require(saleActive); saleActive = false; finalized = true;
        uint256 remaining = picksToken.balanceOf(address(this));
        if (remaining > 0) { picksToken.safeTransfer(owner(), remaining); }
        emit SaleFinalized(totalSold, totalRaised);
    }

    function withdrawETH(address payable to) external onlyOwner {
        require(to != address(0)); uint256 balance = address(this).balance; require(balance > 0);
        (bool success, ) = to.call{value: balance}(""); require(success);
        emit ETHWithdrawn(to, balance);
    }

    function buy(uint256 amount) external payable nonReentrant {
        require(saleActive && amount >= MIN_PURCHASE && amount <= MAX_PURCHASE && totalSold + amount <= maxTokens);
        uint256 cost = calculateCost(amount);
        require(msg.value >= cost);
        totalSold += amount; totalRaised += cost; purchases[msg.sender] += amount;
        picksToken.safeTransfer(msg.sender, amount);
        if (msg.value > cost) { (bool s,) = msg.sender.call{value: msg.value - cost}(""); require(s); }
        emit TokensPurchased(msg.sender, amount, cost, currentPrice());
    }

    function calculateCost(uint256 amount) public view returns (uint256) {
        uint256 baseCost = (amount * basePrice) / 1e18;
        uint256 curveArea = (totalSold * amount) + (amount * amount / 2);
        uint256 curveCost = (slope * curveArea) / 1e18 / 1e18;
        return baseCost + curveCost;
    }

    function currentPrice() public view returns (uint256) { return basePrice + (slope * totalSold) / 1e18; }
    function remainingTokens() external view returns (uint256) { return maxTokens - totalSold; }
    function getQuote(uint256 amount) external view returns (uint256 cost, uint256 priceAfter) {
        cost = calculateCost(amount); priceAfter = basePrice + (slope * (totalSold + amount)) / 1e18;
    }
    receive() external payable {}
}
```

---

## Hardhat Configuration

```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const DEPLOYER_KEY = process.env.DEPLOYER_PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000001";
const BASESCAN_API_KEY = process.env.BASESCAN_API_KEY || "";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: { optimizer: { enabled: true, runs: 200 }, viaIR: true },
  },
  networks: {
    hardhat: { chainId: 31337 },
    baseSepolia: { url: process.env.BASE_SEPOLIA_RPC || "https://sepolia.base.org", accounts: [DEPLOYER_KEY], chainId: 84532 },
    base: { url: process.env.BASE_MAINNET_RPC || "https://mainnet.base.org", accounts: [DEPLOYER_KEY], chainId: 8453 },
  },
  etherscan: { apiKey: BASESCAN_API_KEY },
  paths: { sources: "./src", tests: "./test", cache: "./cache", artifacts: "./artifacts" },
};
export default config;
```

## Dependencies

```json
{
  "dependencies": {
    "@openzeppelin/contracts": "^5.1.0",
    "clanker-sdk": "^4.2.10",
    "viem": "^2.45.3"
  },
  "devDependencies": {
    "@nomicfoundation/hardhat-toolbox": "^5.0.0",
    "hardhat": "^2.28.5",
    "ethers": "^6.16.0",
    "typescript": "^5.9.3"
  }
}
```
