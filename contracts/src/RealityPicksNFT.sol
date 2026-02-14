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
 *
 *  5 Tiers:
 *    0 - Early Supporter  (1,111 max, 0.000111 ETH, open mint)
 *    1 - Player            (3,000 max, 0.00111 ETH,  signature-gated)
 *    2 - Community OG      (1,000 max, 0.00333 ETH,  signature-gated)
 *    3 - Survivor Pro      (  500 max, 0.00888 ETH,  signature-gated)
 *    4 - Legend            (  111 max, 0.0111 ETH,   signature-gated, soulbound)
 *
 *  Revenue split: 75% liquidity, 25% treasury.
 *  Royalties: 5% (EIP-2981).
 *  Legend tier is soulbound (non-transferable).
 */
contract RealityPicksNFT is ERC721, ERC721Enumerable, Ownable, ReentrancyGuard {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    // ─── Tier Config ─────────────────────────────────────────────────────

    struct Tier {
        uint256 maxSupply;      // Total available for this tier
        uint256 minted;         // How many have been minted
        uint256 price;          // Mint price in wei
        bool    active;         // Is minting enabled for this tier?
        bool    soulbound;      // Non-transferable?
        bool    requireSig;     // Requires backend signature?
        string  name;           // "Early Supporter", "Player", etc.
    }

    uint256 public constant NUM_TIERS = 5;
    mapping(uint256 => Tier) public tiers;

    // Token ID → tier mapping
    mapping(uint256 => uint256) public tokenTier;

    // Per-address mint tracking (one NFT per tier per address)
    mapping(address => mapping(uint256 => bool)) public hasMintedTier;

    // Global token counter (1-indexed)
    uint256 private _nextTokenId = 1;

    // ─── Revenue ─────────────────────────────────────────────────────────

    address payable public liquidityReceiver;   // 75% of mint revenue
    address payable public treasuryReceiver;    // 25% of mint revenue

    uint256 public constant LIQUIDITY_BPS = 7500;
    uint256 public constant TREASURY_BPS  = 2500;

    // ─── Signature ───────────────────────────────────────────────────────

    address public trustedSigner;

    // Nonces to prevent signature replay
    mapping(address => uint256) public sigNonces;

    // ─── Royalties (EIP-2981) ────────────────────────────────────────────

    uint96 public constant ROYALTY_BPS = 500; // 5%

    // ─── Metadata ────────────────────────────────────────────────────────

    string private _baseTokenURI;

    // ─── Events ──────────────────────────────────────────────────────────

    event Minted(address indexed to, uint256 indexed tokenId, uint256 indexed tierId);
    event TierToggled(uint256 indexed tierId, bool active);
    event RevenueDistributed(uint256 liquidityAmount, uint256 treasuryAmount);
    event TrustedSignerUpdated(address newSigner);

    // ─── Constructor ─────────────────────────────────────────────────────

    constructor(
        string memory baseURI,
        address payable _treasuryReceiver,
        address payable _liquidityReceiver,
        address _trustedSigner
    ) ERC721("RealityPicks Collection", "RPNFT") Ownable(msg.sender) {
        require(_treasuryReceiver != address(0), "Zero treasury");
        require(_liquidityReceiver != address(0), "Zero liquidity");
        require(_trustedSigner != address(0), "Zero signer");

        _baseTokenURI = baseURI;
        treasuryReceiver = _treasuryReceiver;
        liquidityReceiver = _liquidityReceiver;
        trustedSigner = _trustedSigner;

        // ── Tier 0: Early Supporter ──────────────────────────────────
        tiers[0] = Tier({
            maxSupply:  1111,
            minted:     0,
            price:      0.000111 ether,
            active:     true,
            soulbound:  false,
            requireSig: false,
            name:       "Early Supporter"
        });

        // ── Tier 1: Player ───────────────────────────────────────────
        tiers[1] = Tier({
            maxSupply:  3000,
            minted:     0,
            price:      0.00111 ether,
            active:     false,  // opened later
            soulbound:  false,
            requireSig: true,
            name:       "Player"
        });

        // ── Tier 2: Community OG ─────────────────────────────────────
        tiers[2] = Tier({
            maxSupply:  1000,
            minted:     0,
            price:      0.00333 ether,
            active:     false,
            soulbound:  false,
            requireSig: true,
            name:       "Community OG"
        });

        // ── Tier 3: Survivor Pro ─────────────────────────────────────
        tiers[3] = Tier({
            maxSupply:  500,
            minted:     0,
            price:      0.00888 ether,
            active:     false,
            soulbound:  false,
            requireSig: true,
            name:       "Survivor Pro"
        });

        // ── Tier 4: Legend ───────────────────────────────────────────
        tiers[4] = Tier({
            maxSupply:  111,
            minted:     0,
            price:      0.0111 ether,
            active:     false,
            soulbound:  true,   // Non-transferable
            requireSig: true,
            name:       "Legend"
        });
    }

    // ─── Public Mint (open tiers — Early Supporter) ──────────────────────

    /**
     * @notice Mint an NFT from an open (non-signature) tier
     * @param tierId The tier to mint from (must not requireSig)
     */
    function mint(uint256 tierId) external payable nonReentrant {
        Tier storage tier = tiers[tierId];
        require(tierId < NUM_TIERS, "Invalid tier");
        require(tier.active, "Tier not active");
        require(!tier.requireSig, "Signature required");
        require(!hasMintedTier[msg.sender][tierId], "Already minted this tier");
        require(tier.minted < tier.maxSupply, "Tier sold out");
        require(msg.value == tier.price, "Wrong ETH amount");

        _mintInternal(msg.sender, tierId);
        _distributeRevenue(msg.value);
    }

    // ─── Signature-Gated Mint (Player, Community OG, Survivor Pro, Legend) ─

    /**
     * @notice Mint an NFT using a backend-signed eligibility proof
     * @param tierId The tier to mint from
     * @param signature Backend signature proving eligibility
     */
    function mintWithSignature(
        uint256 tierId,
        bytes calldata signature
    ) external payable nonReentrant {
        Tier storage tier = tiers[tierId];
        require(tierId < NUM_TIERS, "Invalid tier");
        require(tier.active, "Tier not active");
        require(tier.requireSig, "Use mint() for open tiers");
        require(!hasMintedTier[msg.sender][tierId], "Already minted this tier");
        require(tier.minted < tier.maxSupply, "Tier sold out");
        require(msg.value == tier.price, "Wrong ETH amount");

        // Verify the backend signature
        uint256 nonce = sigNonces[msg.sender];
        bytes32 messageHash = keccak256(
            abi.encodePacked(msg.sender, tierId, nonce, block.chainid, address(this))
        );
        bytes32 ethSignedHash = messageHash.toEthSignedMessageHash();
        address recovered = ethSignedHash.recover(signature);
        require(recovered == trustedSigner, "Invalid signature");

        sigNonces[msg.sender]++;
        _mintInternal(msg.sender, tierId);
        _distributeRevenue(msg.value);
    }

    // ─── Internal ────────────────────────────────────────────────────────

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

    // ─── Transfer Restriction (Soulbound) ────────────────────────────────

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721, ERC721Enumerable) returns (address) {
        address from = _ownerOf(tokenId);

        // Allow minting (from == 0) and burning (to == 0), block soulbound transfers
        if (from != address(0) && to != address(0)) {
            require(!tiers[tokenTier[tokenId]].soulbound, "Soulbound: non-transferable");
        }

        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(
        address account,
        uint128 value
    ) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    // ─── Admin ───────────────────────────────────────────────────────────

    function toggleTier(uint256 tierId) external onlyOwner {
        require(tierId < NUM_TIERS, "Invalid tier");
        tiers[tierId].active = !tiers[tierId].active;
        emit TierToggled(tierId, tiers[tierId].active);
    }

    function setTrustedSigner(address _signer) external onlyOwner {
        require(_signer != address(0), "Zero address");
        trustedSigner = _signer;
        emit TrustedSignerUpdated(_signer);
    }

    function setLiquidityReceiver(address payable _receiver) external onlyOwner {
        require(_receiver != address(0), "Zero address");
        liquidityReceiver = _receiver;
    }

    function setTreasuryReceiver(address payable _receiver) external onlyOwner {
        require(_receiver != address(0), "Zero address");
        treasuryReceiver = _receiver;
    }

    function setBaseURI(string calldata newBaseURI) external onlyOwner {
        _baseTokenURI = newBaseURI;
    }

    /**
     * @notice Emergency withdrawal (should never be needed due to auto-split)
     */
    function withdrawStuck() external onlyOwner {
        uint256 bal = address(this).balance;
        require(bal > 0, "No ETH");
        (bool ok,) = owner().call{value: bal}("");
        require(ok, "Transfer failed");
    }

    // ─── View Functions ──────────────────────────────────────────────────

    function getTierInfo(uint256 tierId) external view returns (
        string memory name_,
        uint256 maxSupply_,
        uint256 minted_,
        uint256 remaining_,
        uint256 price_,
        bool active_,
        bool soulbound_,
        bool requireSig_
    ) {
        require(tierId < NUM_TIERS, "Invalid tier");
        Tier storage t = tiers[tierId];
        return (
            t.name,
            t.maxSupply,
            t.minted,
            t.maxSupply - t.minted,
            t.price,
            t.active,
            t.soulbound,
            t.requireSig
        );
    }

    /**
     * @notice Get tier IDs held by a user (returns array of tier IDs, not token IDs)
     */
    function getUserTiers(address user) external view returns (uint256[] memory) {
        uint256 bal = balanceOf(user);
        uint256[] memory result = new uint256[](bal);
        for (uint256 i = 0; i < bal; i++) {
            uint256 tokenId = tokenOfOwnerByIndex(user, i);
            result[i] = tokenTier[tokenId];
        }
        return result;
    }

    function getNonce(address user) external view returns (uint256) {
        return sigNonces[user];
    }

    // ─── Metadata ────────────────────────────────────────────────────────

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    // ─── Royalties (EIP-2981) ────────────────────────────────────────────

    function royaltyInfo(uint256, uint256 salePrice) external view returns (address, uint256) {
        return (treasuryReceiver, (salePrice * ROYALTY_BPS) / 10000);
    }

    // ─── Interface Support ───────────────────────────────────────────────

    function supportsInterface(bytes4 interfaceId)
        public view override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        // EIP-2981 royalty interface: 0x2a55205a
        return interfaceId == 0x2a55205a || super.supportsInterface(interfaceId);
    }
}
