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

    /**
     * @param _communityRewards Wallet for the 40% community rewards pool
     * @param _liquidity Wallet for the 20% liquidity allocation
     * @param _team Wallet for the 15% team allocation (vested)
     * @param _presale Wallet for the 10% presale / bonding curve
     * @param _stakingRewards Wallet for the 10% staking rewards
     * @param _ecosystem Wallet for the 5% ecosystem/partnerships
     */
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

        // Mint entire supply and distribute
        _mint(_communityRewards, (TOTAL_SUPPLY * COMMUNITY_REWARDS_BPS) / 10000);
        _mint(_liquidity, (TOTAL_SUPPLY * LIQUIDITY_BPS) / 10000);
        _mint(_team, (TOTAL_SUPPLY * TEAM_BPS) / 10000);
        _mint(_presale, (TOTAL_SUPPLY * PRESALE_BPS) / 10000);
        _mint(_stakingRewards, (TOTAL_SUPPLY * STAKING_REWARDS_BPS) / 10000);
        _mint(_ecosystem, (TOTAL_SUPPLY * ECOSYSTEM_BPS) / 10000);

        emit TokensDistributed(
            _communityRewards,
            _liquidity,
            _team,
            _presale,
            _stakingRewards,
            _ecosystem
        );
    }
}
