// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title BadgeNFT
 * @notice ERC-1155 achievement badges for SurvivorPicks.
 *         - Soulbound (non-transferable) badges for core achievements
 *         - Tradeable seasonal badges with 5% royalty to treasury
 *         - Metadata stored on IPFS, referenced by token URI
 */
contract BadgeNFT is ERC1155, AccessControl {
    using Strings for uint256;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    string public name = "SurvivorPicks Badges";
    string public symbol = "SPBADGE";

    // Badge type tracking
    mapping(uint256 => bool) public isSoulbound;
    mapping(uint256 => bool) public badgeExists;
    mapping(uint256 => string) private _tokenURIs;

    // Royalty info (EIP-2981 compatible)
    address public royaltyReceiver;
    uint96 public constant ROYALTY_BPS = 500; // 5%

    // Track which users have which badges (for off-chain queries)
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

    // ─── Admin Functions ────────────────────────────────────────────────

    /**
     * @notice Create a new badge type
     * @param tokenId Unique badge ID
     * @param soulbound Whether this badge is non-transferable
     * @param tokenUri IPFS URI for badge metadata
     */
    function createBadge(uint256 tokenId, bool soulbound, string calldata tokenUri) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(!badgeExists[tokenId], "Badge exists");
        badgeExists[tokenId] = true;
        isSoulbound[tokenId] = soulbound;
        _tokenURIs[tokenId] = tokenUri;

        emit BadgeCreated(tokenId, soulbound, tokenUri);
    }

    /**
     * @notice Mint a badge to a user (typically called by PredictionEngine on achievement)
     * @param to Recipient address
     * @param tokenId Badge type to mint
     */
    function mint(address to, uint256 tokenId) external onlyRole(MINTER_ROLE) {
        require(badgeExists[tokenId], "Badge not found");
        require(!hasBadge[to][tokenId], "Already has badge");

        _mint(to, tokenId, 1, "");
        hasBadge[to][tokenId] = true;
        _userBadges[to].push(tokenId);

        emit BadgeMinted(tokenId, to);
    }

    /**
     * @notice Batch mint multiple badges to a user
     */
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

    function setRoyaltyReceiver(address _receiver) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_receiver != address(0), "Zero address");
        royaltyReceiver = _receiver;
    }

    function setBaseURI(string calldata newUri) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _setURI(newUri);
    }

    // ─── View Functions ─────────────────────────────────────────────────

    /**
     * @notice Get the URI for a specific badge
     */
    function uri(uint256 tokenId) public view override returns (string memory) {
        string memory tokenUri = _tokenURIs[tokenId];
        if (bytes(tokenUri).length > 0) {
            return tokenUri;
        }
        return string(abi.encodePacked(super.uri(tokenId), tokenId.toString()));
    }

    /**
     * @notice Get all badge IDs held by a user
     */
    function getUserBadges(address user) external view returns (uint256[] memory) {
        return _userBadges[user];
    }

    /**
     * @notice EIP-2981 royalty info
     */
    function royaltyInfo(uint256, uint256 salePrice) external view returns (address, uint256) {
        uint256 royaltyAmount = (salePrice * ROYALTY_BPS) / 10000;
        return (royaltyReceiver, royaltyAmount);
    }

    // ─── Transfer Restrictions (Soulbound) ──────────────────────────────

    /**
     * @dev Override to enforce soulbound restrictions
     */
    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal override {
        // Allow minting (from == address(0)) and burning (to == address(0))
        if (from != address(0) && to != address(0)) {
            for (uint256 i = 0; i < ids.length; i++) {
                require(!isSoulbound[ids[i]], "Soulbound: non-transferable");
            }
        }
        super._update(from, to, ids, values);
    }

    // ─── Interface Support ──────────────────────────────────────────────

    function supportsInterface(bytes4 interfaceId) public view override(ERC1155, AccessControl) returns (bool) {
        // EIP-2981: 0x2a55205a
        return interfaceId == 0x2a55205a || super.supportsInterface(interfaceId);
    }
}
