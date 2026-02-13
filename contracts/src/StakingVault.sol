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

    // Staking tiers
    uint256 public constant BRONZE_MIN = 1_000 * 1e18;
    uint256 public constant SILVER_MIN = 10_000 * 1e18;
    uint256 public constant GOLD_MIN = 100_000 * 1e18;

    uint256 public constant BRONZE_DURATION = 7 days;
    uint256 public constant SILVER_DURATION = 30 days;
    uint256 public constant GOLD_DURATION = 90 days;

    // Boost multipliers in basis points (10000 = 1x)
    uint256 public constant BRONZE_BOOST_BPS = 11000;  // 1.1x
    uint256 public constant SILVER_BOOST_BPS = 12500;  // 1.25x
    uint256 public constant GOLD_BOOST_BPS = 15000;    // 1.5x
    uint256 public constant NO_BOOST_BPS = 10000;      // 1.0x

    // Reward distribution
    uint256 public rewardRate; // tokens per second
    uint256 public lastUpdateTime;
    uint256 public rewardPerTokenStored;
    uint256 public totalStaked;
    uint256 public rewardEndTime;

    struct StakeInfo {
        uint256 amount;
        uint256 stakedAt;
        uint256 rewardPerTokenPaid;
        uint256 rewards;
    }

    mapping(address => StakeInfo) public stakes;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);
    event RewardRateUpdated(uint256 newRate, uint256 endTime);

    constructor(address _picksToken) Ownable(msg.sender) {
        require(_picksToken != address(0), "Zero token address");
        picksToken = IERC20(_picksToken);
    }

    // ─── Admin ──────────────────────────────────────────────────────────

    /**
     * @notice Set the reward distribution rate
     * @param _rewardRate Tokens per second to distribute
     * @param _duration Duration in seconds for the reward period
     */
    function setRewardRate(uint256 _rewardRate, uint256 _duration) external onlyOwner {
        _updateReward(address(0));
        rewardRate = _rewardRate;
        rewardEndTime = block.timestamp + _duration;
        lastUpdateTime = block.timestamp;
        emit RewardRateUpdated(_rewardRate, rewardEndTime);
    }

    // ─── User Functions ─────────────────────────────────────────────────

    /**
     * @notice Stake $PICKS tokens
     * @param amount Amount to stake
     */
    function stake(uint256 amount) external nonReentrant {
        require(amount > 0, "Zero amount");
        _updateReward(msg.sender);

        picksToken.safeTransferFrom(msg.sender, address(this), amount);

        StakeInfo storage s = stakes[msg.sender];
        if (s.amount == 0) {
            s.stakedAt = block.timestamp;
        }
        s.amount += amount;
        totalStaked += amount;

        emit Staked(msg.sender, amount);
    }

    /**
     * @notice Unstake $PICKS tokens
     * @param amount Amount to unstake
     */
    function unstake(uint256 amount) external nonReentrant {
        StakeInfo storage s = stakes[msg.sender];
        require(s.amount >= amount, "Insufficient stake");
        require(amount > 0, "Zero amount");
        _updateReward(msg.sender);

        s.amount -= amount;
        totalStaked -= amount;

        if (s.amount == 0) {
            s.stakedAt = 0;
        }

        picksToken.safeTransfer(msg.sender, amount);
        emit Unstaked(msg.sender, amount);
    }

    /**
     * @notice Claim accumulated staking rewards
     */
    function claimRewards() external nonReentrant {
        _updateReward(msg.sender);

        StakeInfo storage s = stakes[msg.sender];
        uint256 reward = s.rewards;
        require(reward > 0, "No rewards");

        s.rewards = 0;
        picksToken.safeTransfer(msg.sender, reward);

        emit RewardsClaimed(msg.sender, reward);
    }

    // ─── View Functions ─────────────────────────────────────────────────

    /**
     * @notice Get the staking tier for a user
     * @return tier 0 = none, 1 = bronze, 2 = silver, 3 = gold
     */
    function getUserTier(address user) external view returns (uint8 tier) {
        StakeInfo storage s = stakes[user];
        if (s.amount == 0) return 0;

        uint256 duration = block.timestamp - s.stakedAt;

        if (s.amount >= GOLD_MIN && duration >= GOLD_DURATION) return 3;
        if (s.amount >= SILVER_MIN && duration >= SILVER_DURATION) return 2;
        if (s.amount >= BRONZE_MIN && duration >= BRONZE_DURATION) return 1;
        return 0;
    }

    /**
     * @notice Get the boost multiplier for a user (in BPS, 10000 = 1x)
     */
    function getBoostBPS(address user) external view returns (uint256) {
        StakeInfo storage s = stakes[user];
        if (s.amount == 0) return NO_BOOST_BPS;

        uint256 duration = block.timestamp - s.stakedAt;

        if (s.amount >= GOLD_MIN && duration >= GOLD_DURATION) return GOLD_BOOST_BPS;
        if (s.amount >= SILVER_MIN && duration >= SILVER_DURATION) return SILVER_BOOST_BPS;
        if (s.amount >= BRONZE_MIN && duration >= BRONZE_DURATION) return BRONZE_BOOST_BPS;
        return NO_BOOST_BPS;
    }

    /**
     * @notice Get pending rewards for a user
     */
    function pendingRewards(address user) external view returns (uint256) {
        StakeInfo storage s = stakes[user];
        uint256 currentRewardPerToken = rewardPerTokenStored;

        if (totalStaked > 0) {
            uint256 timeElapsed = _min(block.timestamp, rewardEndTime) - lastUpdateTime;
            currentRewardPerToken += (timeElapsed * rewardRate * 1e18) / totalStaked;
        }

        return s.rewards + (s.amount * (currentRewardPerToken - s.rewardPerTokenPaid)) / 1e18;
    }

    function getStakeInfo(address user) external view returns (
        uint256 amount,
        uint256 stakedAt,
        uint256 rewards
    ) {
        StakeInfo storage s = stakes[user];
        return (s.amount, s.stakedAt, s.rewards);
    }

    // ─── Internal ───────────────────────────────────────────────────────

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

    function _min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }
}
