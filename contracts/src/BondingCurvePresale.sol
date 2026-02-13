// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title BondingCurvePresale
 * @notice OPTIONAL -- only needed for custom deployment path (deploy.ts).
 *         When using Clanker (deploy-clanker.ts), the token launches with instant
 *         Uniswap V4 liquidity instead of a bonding curve presale.
 * @notice Fair token presale using a linear bonding curve.
 *         First buyers get the cheapest price. Price increases linearly with each token sold.
 *         No whitelists, no VCs, no insiders. Transparent and on-chain.
 *
 * Price formula: price_per_token = basePrice + (slope * totalSold)
 * Cost for `amount` tokens: integral of price from totalSold to totalSold+amount
 *   = amount * basePrice + slope * (totalSold * amount + amount^2 / 2)
 */
contract BondingCurvePresale is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable picksToken;

    // Bonding curve parameters
    uint256 public basePrice;    // Starting price per token in wei (ETH)
    uint256 public slope;        // Price increase per token sold (in wei per 1e18 tokens)
    uint256 public maxTokens;    // Maximum tokens available in presale
    uint256 public totalSold;    // Total tokens sold so far (in 1e18 units)
    uint256 public totalRaised;  // Total ETH raised

    bool public saleActive;
    bool public finalized;

    // Minimum and maximum purchase amounts
    uint256 public constant MIN_PURCHASE = 100 * 1e18;     // 100 tokens minimum
    uint256 public constant MAX_PURCHASE = 5_000_000 * 1e18; // 5M tokens maximum per tx

    // Track purchases for each buyer
    mapping(address => uint256) public purchases;

    event TokensPurchased(address indexed buyer, uint256 amount, uint256 cost, uint256 newPrice);
    event SaleStarted(uint256 basePrice, uint256 slope, uint256 maxTokens);
    event SaleFinalized(uint256 totalSold, uint256 totalRaised);
    event ETHWithdrawn(address to, uint256 amount);

    constructor(address _picksToken) Ownable(msg.sender) {
        require(_picksToken != address(0), "Zero token");
        picksToken = IERC20(_picksToken);
    }

    // ─── Admin ──────────────────────────────────────────────────────────

    /**
     * @notice Configure and start the presale
     * @param _basePrice Starting price per token in wei
     * @param _slope Price increase per 1e18 tokens sold (in wei)
     * @param _maxTokens Maximum tokens available (with 18 decimals)
     */
    function startSale(uint256 _basePrice, uint256 _slope, uint256 _maxTokens) external onlyOwner {
        require(!saleActive, "Already active");
        require(!finalized, "Already finalized");
        require(_basePrice > 0, "Zero price");
        require(_maxTokens > 0, "Zero max");

        // Ensure contract has enough tokens
        require(picksToken.balanceOf(address(this)) >= _maxTokens, "Insufficient tokens");

        basePrice = _basePrice;
        slope = _slope;
        maxTokens = _maxTokens;
        saleActive = true;

        emit SaleStarted(_basePrice, _slope, _maxTokens);
    }

    /**
     * @notice Finalize the presale and withdraw remaining tokens
     */
    function finalizeSale() external onlyOwner {
        require(saleActive, "Not active");
        saleActive = false;
        finalized = true;

        // Return unsold tokens to owner
        uint256 remaining = picksToken.balanceOf(address(this));
        if (remaining > 0) {
            picksToken.safeTransfer(owner(), remaining);
        }

        emit SaleFinalized(totalSold, totalRaised);
    }

    /**
     * @notice Withdraw raised ETH
     */
    function withdrawETH(address payable to) external onlyOwner {
        require(to != address(0), "Zero address");
        uint256 balance = address(this).balance;
        require(balance > 0, "No ETH");

        (bool success, ) = to.call{value: balance}("");
        require(success, "ETH transfer failed");

        emit ETHWithdrawn(to, balance);
    }

    // ─── Purchase ───────────────────────────────────────────────────────

    /**
     * @notice Buy tokens at the current bonding curve price
     * @param amount Number of tokens to buy (with 18 decimals)
     */
    function buy(uint256 amount) external payable nonReentrant {
        require(saleActive, "Sale not active");
        require(amount >= MIN_PURCHASE, "Below minimum");
        require(amount <= MAX_PURCHASE, "Above maximum");
        require(totalSold + amount <= maxTokens, "Exceeds available");

        uint256 cost = calculateCost(amount);
        require(msg.value >= cost, "Insufficient ETH");

        totalSold += amount;
        totalRaised += cost;
        purchases[msg.sender] += amount;

        // Transfer tokens to buyer
        picksToken.safeTransfer(msg.sender, amount);

        // Refund excess ETH
        if (msg.value > cost) {
            (bool success, ) = msg.sender.call{value: msg.value - cost}("");
            require(success, "Refund failed");
        }

        emit TokensPurchased(msg.sender, amount, cost, currentPrice());
    }

    // ─── View Functions ─────────────────────────────────────────────────

    /**
     * @notice Calculate cost for buying `amount` tokens at current bonding curve position
     * @dev Uses integral of linear bonding curve:
     *      cost = amount * basePrice + slope * (totalSold * amount + amount^2 / 2) / 1e18
     *      The division by 1e18 normalizes because slope is per 1e18 tokens
     */
    function calculateCost(uint256 amount) public view returns (uint256) {
        // Base cost
        uint256 baseCost = (amount * basePrice) / 1e18;

        // Bonding curve premium
        // integral from totalSold to totalSold+amount of (slope * x / 1e18) dx
        // = slope * (totalSold * amount + amount^2 / 2) / 1e18 / 1e18
        uint256 curveArea = (totalSold * amount) + (amount * amount / 2);
        uint256 curveCost = (slope * curveArea) / 1e18 / 1e18;

        return baseCost + curveCost;
    }

    /**
     * @notice Get the current price per token (in wei)
     */
    function currentPrice() public view returns (uint256) {
        return basePrice + (slope * totalSold) / 1e18;
    }

    /**
     * @notice Get remaining tokens available for purchase
     */
    function remainingTokens() external view returns (uint256) {
        return maxTokens - totalSold;
    }

    /**
     * @notice Get the cost to buy a specific amount at the current price
     */
    function getQuote(uint256 amount) external view returns (uint256 cost, uint256 priceAfter) {
        cost = calculateCost(amount);
        priceAfter = basePrice + (slope * (totalSold + amount)) / 1e18;
    }

    receive() external payable {}
}
