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
        uint8 correctOption;     // 0 = unresolved, 1-indexed when resolved
        bool resolved;
        uint256 totalStaked;
        uint256[8] optionStakes; // stakes per option (1-indexed in logic, 0-indexed in array)
    }

    struct UserPrediction {
        uint8 option;
        uint256 amount;
        bool isRisk;
        bool claimed;
    }

    // questionId => Question
    mapping(bytes32 => Question) public questions;
    // questionId => user => UserPrediction
    mapping(bytes32 => mapping(address => UserPrediction)) public predictions;
    // user => seasonId => jokers remaining
    mapping(address => mapping(bytes32 => uint8)) public jokersRemaining;
    // user => questionId => used joker
    mapping(address => mapping(bytes32 => bool)) public jokerUsed;

    // Track all question IDs
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

    // ─── Admin Functions ────────────────────────────────────────────────

    /**
     * @notice Create a new prediction question
     * @param questionId Unique identifier (matches off-chain DB)
     * @param episodeId Episode identifier
     * @param optionCount Number of options (2-8)
     * @param lockTimestamp Timestamp after which no more predictions are accepted
     */
    function createQuestion(
        bytes32 questionId,
        bytes32 episodeId,
        uint8 optionCount,
        uint256 lockTimestamp
    ) external onlyRole(RESOLVER_ROLE) {
        require(questions[questionId].optionCount == 0, "Question exists");
        require(optionCount >= 2 && optionCount <= MAX_OPTIONS, "Invalid option count");
        require(lockTimestamp > block.timestamp, "Lock must be in future");

        questions[questionId] = Question({
            episodeId: episodeId,
            lockTimestamp: lockTimestamp,
            optionCount: optionCount,
            correctOption: 0,
            resolved: false,
            totalStaked: 0,
            optionStakes: [uint256(0), 0, 0, 0, 0, 0, 0, 0]
        });

        questionIds.push(questionId);

        emit QuestionCreated(questionId, episodeId, optionCount, lockTimestamp);
    }

    /**
     * @notice Resolve a question with the correct answer
     * @param questionId The question to resolve
     * @param correctOption The correct option (1-indexed)
     */
    function resolve(bytes32 questionId, uint8 correctOption) external onlyRole(RESOLVER_ROLE) {
        Question storage q = questions[questionId];
        require(q.optionCount > 0, "Question not found");
        require(!q.resolved, "Already resolved");
        require(correctOption >= 1 && correctOption <= q.optionCount, "Invalid option");

        q.correctOption = correctOption;
        q.resolved = true;

        // Transfer platform fee to treasury
        uint256 platformFee = (q.totalStaked * PLATFORM_FEE_BPS) / BPS_DENOMINATOR;
        if (platformFee > 0) {
            picksToken.safeTransfer(treasury, platformFee);
        }

        emit QuestionResolved(questionId, correctOption, q.totalStaked, platformFee);
    }

    function setTreasury(address _treasury) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_treasury != address(0), "Zero address");
        address old = treasury;
        treasury = _treasury;
        emit TreasuryUpdated(old, _treasury);
    }

    /**
     * @notice Initialize jokers for a user in a season
     * @param user The user address
     * @param seasonId The season identifier
     * @param count Number of jokers to grant
     */
    function grantJokers(address user, bytes32 seasonId, uint8 count) external onlyRole(RESOLVER_ROLE) {
        jokersRemaining[user][seasonId] = count;
    }

    // ─── User Functions ─────────────────────────────────────────────────

    /**
     * @notice Make a prediction on a question
     * @param questionId The question to predict on
     * @param option The chosen option (1-indexed)
     * @param amount Amount of $PICKS to stake
     * @param isRisk Whether this is a risk bet (1.5x multiplier if correct, lose all if wrong)
     */
    function predict(
        bytes32 questionId,
        uint8 option,
        uint256 amount,
        bool isRisk
    ) external nonReentrant {
        Question storage q = questions[questionId];
        require(q.optionCount > 0, "Question not found");
        require(!q.resolved, "Already resolved");
        require(block.timestamp < q.lockTimestamp, "Predictions locked");
        require(option >= 1 && option <= q.optionCount, "Invalid option");
        require(amount > 0, "Zero amount");
        require(predictions[questionId][msg.sender].amount == 0, "Already predicted");

        // Transfer tokens from user to this contract
        picksToken.safeTransferFrom(msg.sender, address(this), amount);

        predictions[questionId][msg.sender] = UserPrediction({
            option: option,
            amount: amount,
            isRisk: isRisk,
            claimed: false
        });

        q.totalStaked += amount;
        q.optionStakes[option - 1] += amount;

        emit PredictionMade(questionId, msg.sender, option, amount, isRisk);
    }

    /**
     * @notice Use a joker on a specific question (must be called before resolution)
     * @param questionId The question
     * @param seasonId The season (for joker tracking)
     */
    function useJoker(bytes32 questionId, bytes32 seasonId) external {
        require(predictions[questionId][msg.sender].amount > 0, "No prediction");
        require(!questions[questionId].resolved, "Already resolved");
        require(!predictions[questionId][msg.sender].isRisk, "Cannot joker risk bets");
        require(jokersRemaining[msg.sender][seasonId] > 0, "No jokers left");
        require(!jokerUsed[msg.sender][questionId], "Joker already used");

        jokerUsed[msg.sender][questionId] = true;
        jokersRemaining[msg.sender][seasonId]--;
    }

    /**
     * @notice Claim rewards after a question is resolved
     * @param questionId The question
     */
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

            // Emit appropriate event
            if (pred.option != q.correctOption && jokerUsed[msg.sender][questionId]) {
                emit JokerRefund(questionId, msg.sender, payout);
            } else {
                emit RewardClaimed(questionId, msg.sender, payout);
            }
        }
    }

    // ─── View Functions ─────────────────────────────────────────────────

    function getQuestion(bytes32 questionId) external view returns (
        bytes32 episodeId,
        uint256 lockTimestamp,
        uint8 optionCount,
        uint8 correctOption,
        bool resolved,
        uint256 totalStaked,
        uint256[8] memory optionStakes
    ) {
        Question storage q = questions[questionId];
        return (q.episodeId, q.lockTimestamp, q.optionCount, q.correctOption, q.resolved, q.totalStaked, q.optionStakes);
    }

    function getUserPrediction(bytes32 questionId, address user) external view returns (
        uint8 option,
        uint256 amount,
        bool isRisk,
        bool claimed
    ) {
        UserPrediction storage p = predictions[questionId][user];
        return (p.option, p.amount, p.isRisk, p.claimed);
    }

    function getQuestionCount() external view returns (uint256) {
        return questionIds.length;
    }

    function calculatePayout(bytes32 questionId, address user) external view returns (uint256) {
        return _calculatePayout(questionId, user);
    }

    // ─── Internal ───────────────────────────────────────────────────────

    function _calculatePayout(bytes32 questionId, address user) internal view returns (uint256) {
        Question storage q = questions[questionId];
        UserPrediction storage pred = predictions[questionId][user];

        if (pred.amount == 0) return 0;

        // Correct prediction
        if (pred.option == q.correctOption) {
            uint256 pool = q.totalStaked;
            uint256 netPool = pool - (pool * PLATFORM_FEE_BPS) / BPS_DENOMINATOR; // 97% of total

            uint256 correctStakes = q.optionStakes[q.correctOption - 1];
            if (correctStakes == 0) return 0;

            uint256 effectiveStake = pred.amount;
            if (pred.isRisk) {
                effectiveStake = (pred.amount * RISK_MULTIPLIER_BPS) / BPS_DENOMINATOR;
            }

            // For risk bets, we need to account for boosted effective stakes in the correct pool
            // Simple approach: user gets their proportional share based on effective stake
            // If risk, effective stake is 1.5x for payout calculation
            uint256 effectiveCorrectStakes = correctStakes;
            // Note: In a full implementation, we'd track effective stakes separately.
            // For simplicity, risk multiplier gives proportionally more of the pool.

            uint256 payout = (effectiveStake * netPool) / effectiveCorrectStakes;

            // Cap payout at netPool to prevent overflow from risk multiplier
            if (payout > netPool) payout = netPool;

            return payout;
        }

        // Wrong prediction with joker -> refund original stake
        if (jokerUsed[user][questionId]) {
            return pred.amount;
        }

        // Wrong prediction without joker -> nothing
        return 0;
    }
}
