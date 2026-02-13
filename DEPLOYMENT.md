# SurvivorPicks - Mainnet Deployment Guide

Complete step-by-step guide to deploy the SurvivorPicks platform on Base mainnet.

You have **two deployment paths**:

- **Path A (Recommended): Clanker** -- Deploy $PICKS via Clanker for instant Uniswap V4 liquidity, ecosystem visibility, and LP fee revenue. Then deploy utility contracts separately.
- **Path B: Custom** -- Deploy all contracts yourself, including PicksToken, BondingCurvePresale, and manual LP setup.

---

## Prerequisites

Before starting, ensure you have:

- [ ] A **deployer wallet** with at least **0.05 ETH on Base mainnet** (for gas)
- [ ] A **Basescan API key** from [basescan.org](https://basescan.org/apis)
- [ ] A **WalletConnect Project ID** from [cloud.walletconnect.com](https://cloud.walletconnect.com)
- [ ] **Node.js v18+** and **npm v9+** installed
- [ ] A **PostgreSQL database** (e.g., Neon, Supabase, Railway)
- [ ] A **Vercel account** for frontend deployment

---

## Path A: Clanker Deployment (Recommended)

### A1. Deploy $PICKS Token via Clanker

**Option 1: Web UI (easiest)**

1. Go to [clanker.world/deploy](https://www.clanker.world/deploy)
2. Connect your deployer wallet
3. Configure the token:
   - **Name:** SurvivorPicks
   - **Symbol:** PICKS
   - **Vault:** 50% of supply, 7-day lockup, 730-day (2yr) vesting
   - **Airdrop:** 5% to early supporters, 30-day lockup, 30-day vesting
   - **Fees:** Static 1% on both sides
   - **Rewards:** 100% to your admin wallet
   - **Pool:** Standard, paired with WETH, initial market cap ~10 ETH
4. Deploy and note the token contract address

**Option 2: API / Script**

```bash
cd contracts/

# Set your Clanker API key and deployer key
export CLANKER_API_KEY=your_clanker_api_key
export DEPLOYER_PRIVATE_KEY=0xYOUR_KEY

# Deploy token via Clanker + utility contracts in one go
npm run deploy:clanker:mainnet
```

**Option 3: Use existing Clanker token**

If you already deployed $PICKS via Clanker:

```bash
cd contracts/

export PICKS_TOKEN_ADDRESS=0xYOUR_CLANKER_TOKEN_ADDRESS
export DEPLOYER_PRIVATE_KEY=0xYOUR_KEY

npm run deploy:clanker:mainnet
```

### A2. Deploy Utility Contracts

The Clanker deploy script (`deploy-clanker.ts`) automatically deploys:
- Treasury (fee collection, buyback-and-burn)
- PredictionEngine (on-chain prediction market)
- StakingVault (tiered staking with boost multipliers)
- BadgeNFT (ERC-1155 achievement badges)
- SeasonPass (ERC-721 premium passes)

And configures roles (MINTER_ROLE, RESOLVER_ROLE).

### A3. Verify Contracts

```bash
npm run verify:mainnet
```

### A4. Clanker Revenue

Your revenue sources with Clanker:

- **LP trading fees** -- Every $PICKS swap generates fees. You earn 100% of LP fees via clanker.world (minus 20% Clanker protocol fee).
- **3% prediction fees** -- Flows to Treasury from PredictionEngine.
- **Season Pass burns** -- Users burn $PICKS, reducing supply.
- **NFT royalties** -- 5% on tradeable badge secondary sales.
- **Vaulted tokens** -- Your 50% vault vests over 2 years.

Claim LP rewards at: `https://www.clanker.world/clanker/YOUR_TOKEN_ADDRESS/admin`

---

## Path B: Custom Deployment

### B1. Configure Environment

```bash
cd contracts/

cat > .env << 'EOF'
DEPLOYER_PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE
BASESCAN_API_KEY=YOUR_BASESCAN_API_KEY
BASE_MAINNET_RPC=https://mainnet.base.org

# Token allocation wallets (OPTIONAL - defaults to deployer)
# COMMUNITY_REWARDS_WALLET=0x...
# LIQUIDITY_WALLET=0x...
# TEAM_WALLET=0x...
# STAKING_REWARDS_WALLET=0x...
# ECOSYSTEM_WALLET=0x...
EOF
```

### B2. Deploy All Contracts

```bash
# Test on Sepolia first
npm run deploy:sepolia
npm run verify:sepolia

# Then mainnet
npm run deploy:mainnet
npm run verify:mainnet
```

This deploys all 7 contracts: PicksToken, Treasury, PredictionEngine, StakingVault, BadgeNFT, SeasonPass, and BondingCurvePresale.

### B3. Set Up DEX Liquidity

After the presale, manually add liquidity on Uniswap:

1. Go to [app.uniswap.org](https://app.uniswap.org) > Pool > New Position
2. Select $PICKS / ETH pair on Base
3. Add liquidity with the 200M tokens from LIQUIDITY_WALLET
4. Lock LP for 12+ months via [Team Finance](https://team.finance/)

---

## Frontend Deployment (Both Paths)

### 1. Update Environment Variables

Copy the generated env snippet from the deployment output:

```bash
# From contracts/deployments/base-clanker.env (Path A)
# or contracts/deployments/base.env (Path B)
cat contracts/deployments/base*.env >> .env.local
```

Required variables:

```env
NEXT_PUBLIC_CHAIN=mainnet
NEXT_PUBLIC_BASE_RPC=https://mainnet.base.org
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

NEXT_PUBLIC_PICKS_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_TREASURY_ADDRESS=0x...
NEXT_PUBLIC_PREDICTION_ENGINE_ADDRESS=0x...
NEXT_PUBLIC_STAKING_VAULT_ADDRESS=0x...
NEXT_PUBLIC_BADGE_NFT_ADDRESS=0x...
NEXT_PUBLIC_SEASON_PASS_ADDRESS=0x...

# For Clanker path: set the token page link
NEXT_PUBLIC_CLANKER_TOKEN_URL=https://www.clanker.world/clanker/0xYOUR_TOKEN/admin

DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=generate_a_random_secret
NEXTAUTH_URL=https://yourdomain.com
```

### 2. Deploy to Vercel

```bash
git add . && git commit -m "production deployment"
git push origin main
# Import repo in Vercel, set env vars, deploy
```

### 3. Database Setup

```bash
npx prisma migrate deploy
npx prisma db seed
```

---

## Go Live Checklist

### Pre-Launch
- [ ] Contracts deployed and verified on Basescan
- [ ] Frontend deployed and connected to mainnet contracts
- [ ] Database seeded with seasons, episodes, questions
- [ ] Token page (`/token`) shows correct info and links
- [ ] Staking page functional
- [ ] Admin panel can create questions and resolve episodes
- [ ] Event indexer running

### Launch Day (Clanker Path)
1. Token is already live on Uniswap via Clanker
2. Share the `/token` page link -- it has Uniswap and Clanker links
3. Monitor trading on [DEX Screener](https://dexscreener.com)
4. Claim LP rewards periodically at clanker.world admin

### Post-Launch
- [ ] Execute periodic `buybackAndBurn()` on Treasury (weekly)
- [ ] Create new episodes/questions as the show airs
- [ ] Resolve episodes promptly
- [ ] Engage community with seasonal badges and referral program
- [ ] Claim LP fees from Clanker admin page

---

## Smart Contract Architecture

| Contract | Description | Custom Deploy | Clanker Deploy |
|---|---|---|---|
| PicksToken | ERC-20 token | Deployed by us | Deployed by Clanker |
| BondingCurvePresale | Fair presale | Deployed | Not needed |
| Treasury | Fee collection, buyback | Deployed | Deployed |
| PredictionEngine | Prediction market | Deployed | Deployed |
| StakingVault | Token staking | Deployed | Deployed |
| BadgeNFT | Achievement NFTs | Deployed | Deployed |
| SeasonPass | Premium passes | Deployed | Deployed |

---

## Security Considerations

- All contracts use OpenZeppelin audited bases
- ReentrancyGuard on all state-changing functions
- AccessControl for admin operations
- Treasury has timelocked withdrawals (48h delay, 10% cap)
- Use a hardware wallet for the deployer key
- Consider transferring ownership to a multisig (Gnosis Safe) after deployment

---

## File Reference

```
contracts/
  src/                          # Solidity contracts
    PicksToken.sol              # ERC-20 (optional with Clanker)
    BondingCurvePresale.sol     # Presale (optional with Clanker)
    PredictionEngine.sol        # Core prediction market
    StakingVault.sol            # Token staking
    BadgeNFT.sol                # ERC-1155 badges
    SeasonPass.sol              # ERC-721 passes
    Treasury.sol                # Fee management
  scripts/
    deploy.ts                   # Custom deploy (all contracts)
    deploy-clanker.ts           # Clanker deploy (utility contracts only)
    verify.ts                   # Basescan verification
  test/                         # Contract tests (65 passing)
  deployments/                  # Generated addresses after deploy

src/lib/web3/
  config.ts                     # wagmi + RainbowKit config
  contracts.ts                  # Contract addresses per chain
  hooks.ts                      # React hooks for contract interaction
  abis.ts                       # Contract ABIs

src/app/token/                  # $PICKS token info page
src/app/staking/                # Staking dashboard
```
