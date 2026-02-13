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
 *         - Limited supply per season (e.g. 1000)
 *         - Price increases as passes sell out (bonding curve)
 *         - Grants boosted rewards, exclusive questions, custom badges
 */
contract SeasonPass is ERC721, ERC721Enumerable, Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    ERC20Burnable public immutable picksToken;

    uint256 public maxSupply;
    uint256 public nextTokenId = 1;
    string public baseTokenURI;

    // Bonding curve parameters
    uint256 public basePrice;     // Starting price in $PICKS (with 18 decimals)
    uint256 public priceIncrement; // Price increase per pass sold

    // Season metadata
    bytes32 public seasonId;
    bool public saleActive;

    // Track pass holders for benefits
    mapping(uint256 => bytes32) public passSeasonId;

    event PassPurchased(address indexed buyer, uint256 indexed tokenId, uint256 price, uint256 tokensBurned);
    event SaleToggled(bool active);
    event SeasonConfigured(bytes32 seasonId, uint256 maxSupply, uint256 basePrice, uint256 priceIncrement);

    constructor(
        address _picksToken,
        string memory _name,
        string memory _symbol
    ) ERC721(_name, _symbol) Ownable(msg.sender) {
        require(_picksToken != address(0), "Zero token");
        picksToken = ERC20Burnable(_picksToken);
    }

    // ─── Admin ──────────────────────────────────────────────────────────

    /**
     * @notice Configure a new season's pass sale
     * @param _seasonId Season identifier
     * @param _maxSupply Maximum passes available
     * @param _basePrice Starting price in $PICKS (18 decimals)
     * @param _priceIncrement Price increase per pass sold
     */
    function configureSeason(
        bytes32 _seasonId,
        uint256 _maxSupply,
        uint256 _basePrice,
        uint256 _priceIncrement
    ) external onlyOwner {
        require(_maxSupply > 0, "Zero supply");
        require(_basePrice > 0, "Zero price");

        seasonId = _seasonId;
        maxSupply = _maxSupply;
        basePrice = _basePrice;
        priceIncrement = _priceIncrement;
        nextTokenId = 1;

        emit SeasonConfigured(_seasonId, _maxSupply, _basePrice, _priceIncrement);
    }

    function toggleSale() external onlyOwner {
        saleActive = !saleActive;
        emit SaleToggled(saleActive);
    }

    function setBaseURI(string calldata _uri) external onlyOwner {
        baseTokenURI = _uri;
    }

    // ─── Purchase ───────────────────────────────────────────────────────

    /**
     * @notice Purchase a season pass by burning $PICKS
     */
    function purchase() external nonReentrant {
        require(saleActive, "Sale not active");
        require(nextTokenId <= maxSupply, "Sold out");

        uint256 price = currentPrice();

        // Burn the $PICKS tokens (deflationary!)
        // Transfer to this contract first, then burn
        IERC20(address(picksToken)).transferFrom(msg.sender, address(this), price);
        picksToken.burn(price);

        uint256 tokenId = nextTokenId++;
        _safeMint(msg.sender, tokenId);
        passSeasonId[tokenId] = seasonId;

        emit PassPurchased(msg.sender, tokenId, price, price);
    }

    // ─── View Functions ─────────────────────────────────────────────────

    /**
     * @notice Get the current pass price based on bonding curve
     */
    function currentPrice() public view returns (uint256) {
        return basePrice + (priceIncrement * (nextTokenId - 1));
    }

    /**
     * @notice Check if a user holds a pass for the current season
     */
    function hasActivePass(address user) external view returns (bool) {
        uint256 balance = balanceOf(user);
        for (uint256 i = 0; i < balance; i++) {
            uint256 tokenId = tokenOfOwnerByIndex(user, i);
            if (passSeasonId[tokenId] == seasonId) {
                return true;
            }
        }
        return false;
    }

    /**
     * @notice Get remaining passes available
     */
    function remainingSupply() external view returns (uint256) {
        if (nextTokenId > maxSupply) return 0;
        return maxSupply - nextTokenId + 1;
    }

    // ─── Overrides ──────────────────────────────────────────────────────

    function _baseURI() internal view override returns (string memory) {
        return baseTokenURI;
    }

    function _update(address to, uint256 tokenId, address auth)
        internal override(ERC721, ERC721Enumerable) returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
