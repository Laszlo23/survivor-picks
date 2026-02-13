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
- [ ] An **SMTP email provider** for magic link auth (Resend, SendGrid, or Postmark)

---

## Path A: Clanker Deployment (Recommended)

### A1. Deploy $PICKS Token via Clanker

**Option 1: Clanker SDK (recommended)**

Uses the official `clanker-sdk` v4. No API key needed -- signs directly with your wallet.

```bash
cd contracts/

# Create .env from example
cp .env.example .env

# Edit .env and set your deployer key:
#   DEPLOYER_PRIVATE_KEY=0xYOUR_PRIVATE_KEY

# Deploy $PICKS token via Clanker SDK
npm run deploy:clanker:token
```

This will:
- Deploy the $PICKS ERC-20 token on Base via Clanker
- Create a Uniswap V4 pool (PICKS/WETH) with instant liquidity
- Lock 50% in a vault (7-day lockup, 2-year vesting)
- Set 1% static fees on both sides
- Print the token address and save it to `deployments/clanker-token.json`

**Option 2: Clanker Web UI**

1. Go to [clanker.world/deploy](https://www.clanker.world/deploy)
2. Connect your deployer wallet
3. Configure:
   - **Name:** SurvivorPicks
   - **Symbol:** PICKS
   - **Vault:** 50%, 7-day lockup, 730-day vesting
   - **Fees:** Static 1% on both sides
   - **Rewards:** 100% to your admin wallet
   - **Pool:** Standard, paired with WETH
4. Deploy and note the token address

### A2. Deploy Utility Contracts

After deploying the token, deploy the 5 utility contracts:

```bash
cd contracts/

# Set the token address from step A1
export PICKS_TOKEN_ADDRESS=0xYOUR_CLANKER_TOKEN_ADDRESS

# Deploy utility contracts to Base mainnet
npm run deploy:clanker:mainnet
```

This deploys:
- **Treasury** (fee collection, buyback-and-burn)
- **PredictionEngine** (on-chain prediction market)
- **StakingVault** (tiered staking with boost multipliers)
- **BadgeNFT** (ERC-1155 achievement badges)
- **SeasonPass** (ERC-721 premium passes)

And configures roles (MINTER_ROLE on BadgeNFT for PredictionEngine).

### A3. Verify Contracts

```bash
# Set your Basescan API key
export BASESCAN_API_KEY=your_key

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
cp .env.example .env
# Edit .env with your keys and wallet addresses
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

Add remaining required variables to `.env.local`:

```env
# Chain
NEXT_PUBLIC_CHAIN=mainnet
NEXT_PUBLIC_BASE_RPC=https://base-mainnet.g.alchemy.com/v2/YOUR_KEY
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# Contract addresses (from deployment output)
NEXT_PUBLIC_PICKS_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_TREASURY_ADDRESS=0x...
NEXT_PUBLIC_PREDICTION_ENGINE_ADDRESS=0x...
NEXT_PUBLIC_STAKING_VAULT_ADDRESS=0x...
NEXT_PUBLIC_BADGE_NFT_ADDRESS=0x...
NEXT_PUBLIC_SEASON_PASS_ADDRESS=0x...

# Clanker admin link (Path A only)
NEXT_PUBLIC_CLANKER_TOKEN_URL=https://www.clanker.world/clanker/0xTOKEN/admin

# Database
DATABASE_URL=postgresql://...

# Auth
NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32
NEXTAUTH_URL=https://yourdomain.com

# Email (magic link login)
EMAIL_SERVER_HOST=smtp.resend.com
EMAIL_SERVER_PORT=465
EMAIL_SERVER_USER=resend
EMAIL_SERVER_PASSWORD=re_YOUR_KEY
EMAIL_FROM=noreply@survivorpicks.com

# Admin
ADMIN_EMAIL=your@email.com

# Indexer
INDEXER_API_KEY=generate_a_random_string
```

### 2. Deploy to Vercel

```bash
# Push latest code
git add . && git commit -m "production config"
git push origin main

# Then in Vercel:
# 1. Import the GitHub repo
# 2. Set all environment variables from .env.local
# 3. Deploy
```

Or use the Vercel CLI:

```bash
npx vercel --prod
```

### 3. Database Setup

```bash
# Create tables
npx prisma db push

# Seed initial data (seasons, episodes, contestants)
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
- [ ] Email magic link login working
- [ ] WalletConnect working

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
- Dev login route is blocked in production (`NODE_ENV=production`)

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
    deploy-token-clanker.ts     # Clanker SDK token deployment
    deploy-clanker.ts           # Utility contracts (Clanker path)
    deploy.ts                   # Custom deploy (all contracts)
    verify.ts                   # Basescan verification (both paths)
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
