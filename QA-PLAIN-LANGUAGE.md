# QA Checklist: Plain Language & Tooltips

Verify these items across the app, especially on mobile.

## Terminology & Tooltips

- [ ] **Glossary** (`/help`) — All terms listed with definitions
- [ ] **GlossaryTooltip** — Info icon + tooltip render correctly on mobile (tap to show)
- [ ] **Season points** — Replaces "XP" in dashboard, daily tasks
- [ ] **Win streak** — Replaces "Streak" in stats, leaderboard
- [ ] **Hit rate** — Replaces "Win rate" in dashboard
- [ ] **Place** — Replaces "Rank" in dashboard
- [ ] **Pick rounds** — Replaces "markets" in landing, play
- [ ] **Boost** — Replaces "multiplier" / "Odds" in AI, prediction cards
- [ ] **Token rewards (optional)** — Replaces "$PICKS rewards" in cards
- [ ] **pts** → **points** where shown

## Navigation

- [ ] **Primary nav**: Play, AI, Leaderboard, Badges, Help (no Live, no Token)
- [ ] **Footer**: Token, Tokenomics, Contracts, Investors, Whitepaper, Blog, Discord
- [ ] **Mobile bottom tabs**: Play, Live, AI, Leaderboard, Badges
- [ ] **Help page** (`/help`) — Glossary + FAQ accessible

## Page-by-Page

### Landing
- [ ] "Every episode is a pick round"
- [ ] "Make your pick" (not "Predict Now")
- [ ] "Browse pick rounds" (not "Browse Markets")
- [ ] Tokens optional line in hero
- [ ] Featured pick round, questions available, token rewards (optional)

### Play
- [ ] Tabs: All, Live, Coming Soon, Locked, Finished
- [ ] "X questions available"
- [ ] "Token rewards (optional)"
- [ ] "New pick round" for low-participant rounds
- [ ] "Make your pick" CTA

### Live
- [ ] "Odds change in real-time based on what players are picking"

### Dashboard
- [ ] "Daily tasks" (not "Daily Missions")
- [ ] Legend: "Season points = ... Win streak = ..."
- [ ] "Tap to choose" (not "Tap to pick")
- [ ] "Possible points" (not "Pts potential")
- [ ] Status banner when user already picked: "You already made your picks for EPX. You can still change until the episode locks."

### AI
- [ ] Header: "Tips vs AI"
- [ ] "Pick the same" / "Pick the opposite" (not Follow/Fade AI)
- [ ] "Boost ~1.9x" (not "Odds x1.9")
- [ ] Disclaimer: "Boost is approximate and can change."

### Leaderboard
- [ ] "Community results" tab
- [ ] 0 players: "No one has joined yet. Be the first!"

### Collectibles
- [ ] Intro: "Badges that improve your game. Optional, like boosters."
- [ ] Nav label: "Badges" (not "NFTs")

### Token
- [ ] 3-part story: Play → earn points → optional tokens
- [ ] "Your token balance is stored in your account. Later, you can move it to your wallet."
- [ ] Burn explained once: "Tokens are bought and removed from circulation"

### Tokenomics / Contracts / Investors / Whitepaper / Blog
- [ ] Top warning: "Advanced details. Most players don't need this."

## Mobile-Specific

- [ ] Tooltips work on tap (not just hover)
- [ ] Bottom tabs show correct labels
- [ ] Status banner readable on small screens
- [ ] Help/Glossary page scrollable and readable
