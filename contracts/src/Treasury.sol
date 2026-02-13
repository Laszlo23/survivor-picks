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

    // Withdrawal limits
    uint256 public constant WITHDRAWAL_COOLDOWN = 7 days;
    uint256 public constant MAX_WITHDRAWAL_BPS = 1000; // Max 10% of treasury per withdrawal

    uint256 public lastWithdrawTime;
    uint256 public totalBurned;
    uint256 public totalWithdrawn;

    // Pending withdrawal (timelock)
    struct PendingWithdrawal {
        address to;
        uint256 amount;
        uint256 executeAfter;
        bool executed;
    }

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

    // ─── Fee Collection ─────────────────────────────────────────────────

    /**
     * @notice Receive ETH (from royalties, etc.)
     */
    receive() external payable {
        emit FeeReceived(msg.sender, msg.value);
    }

    // ─── Buyback + Burn ─────────────────────────────────────────────────

    /**
     * @notice Burn $PICKS from the treasury (deflationary mechanism)
     * @param amount Amount of $PICKS to burn
     */
    function buybackAndBurn(uint256 amount) external onlyOwner nonReentrant {
        require(amount > 0, "Zero amount");
        uint256 balance = picksToken.balanceOf(address(this));
        require(balance >= amount, "Insufficient balance");

        picksToken.burn(amount);
        totalBurned += amount;

        emit BuybackAndBurn(amount);
    }

    // ─── Timelocked Withdrawals ─────────────────────────────────────────

    /**
     * @notice Queue a withdrawal (subject to timelock and caps)
     * @param to Recipient address
     * @param amount Amount of $PICKS to withdraw
     */
    function queueWithdrawal(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Zero address");
        require(amount > 0, "Zero amount");

        // Cap at 10% of current treasury balance
        uint256 balance = picksToken.balanceOf(address(this));
        uint256 maxAmount = (balance * MAX_WITHDRAWAL_BPS) / 10000;
        require(amount <= maxAmount, "Exceeds 10% cap");

        uint256 executeAfter = block.timestamp + WITHDRAWAL_COOLDOWN;

        pendingWithdrawals.push(PendingWithdrawal({
            to: to,
            amount: amount,
            executeAfter: executeAfter,
            executed: false
        }));

        uint256 id = pendingWithdrawals.length - 1;
        emit WithdrawalQueued(id, to, amount, executeAfter);
    }

    /**
     * @notice Execute a queued withdrawal after timelock expires
     * @param id Withdrawal ID
     */
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

    /**
     * @notice Cancel a pending withdrawal
     * @param id Withdrawal ID
     */
    function cancelWithdrawal(uint256 id) external onlyOwner {
        require(id < pendingWithdrawals.length, "Invalid ID");
        PendingWithdrawal storage w = pendingWithdrawals[id];
        require(!w.executed, "Already executed");

        w.executed = true; // Mark as executed to prevent future execution
        emit WithdrawalCancelled(id);
    }

    /**
     * @notice Withdraw ETH from treasury
     * @param to Recipient
     * @param amount Amount of ETH
     */
    function withdrawETH(address payable to, uint256 amount) external onlyOwner nonReentrant {
        require(to != address(0), "Zero address");
        require(amount <= address(this).balance, "Insufficient ETH");

        (bool success, ) = to.call{value: amount}("");
        require(success, "ETH transfer failed");

        emit ETHWithdrawn(to, amount);
    }

    // ─── View Functions ─────────────────────────────────────────────────

    function treasuryBalance() external view returns (uint256) {
        return picksToken.balanceOf(address(this));
    }

    function ethBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function pendingWithdrawalCount() external view returns (uint256) {
        return pendingWithdrawals.length;
    }

    function getPendingWithdrawal(uint256 id) external view returns (
        address to,
        uint256 amount,
        uint256 executeAfter,
        bool executed
    ) {
        PendingWithdrawal storage w = pendingWithdrawals[id];
        return (w.to, w.amount, w.executeAfter, w.executed);
    }
}
