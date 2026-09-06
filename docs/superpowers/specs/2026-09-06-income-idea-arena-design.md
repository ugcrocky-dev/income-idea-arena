# Income Idea Arena — Design Spec

**Date:** 2026-09-06  
**Repo:** `ugcrocky-dev/income-idea-arena`  
**Status:** Approved hybrid (Approach A + B); awaiting spec review before implementation plan

## Goal

Ship an operator dashboard with **100 automate-and-earn ideas**, ranked by a **static score** plus optional **live radar signals**, so we can shortlist and pick the next build (same gate pattern as Polymarket / FOMO paper labs).

## Product summary

- **Brand:** Idea Arena  
- **v1:** Static catalog + scoreboard + shortlist/top-10 picker (Approach A)  
- **v1 also:** Live scoring layer that degrades when APIs/keys are missing (Approach B)  
- **Blended score:** `0.6 × static + 0.4 × live` when live is available; else static only  
- **No auth, no payments, no live trading execution, no affiliate auto-apply in v1**

## Users

Primary: Rocky / operator choosing the next income automation to build.

## Architecture

```
Next.js (App Router)
├── data/ideas.json          # 100 ideas (source of truth)
├── lib/scoring.ts           # static + blend helpers
├── app/api/radar/route.ts   # optional live signals
├── app/page.tsx             # Idea Arena UI
└── localStorage             # stars, top-10 order, score mode
```

### Live signals (best-effort)

| Signal key | Source | Used when idea declares it |
|------------|--------|----------------------------|
| `polymarket_volume` | Polymarket public API | prediction / trading labs |
| `x_trend` | X search (if MCP/API available); else neutral | content / social-copy ideas |
| `affiliate_epc` | tagged default / manual later | affiliate ideas |
| `none` | live = static | everything else |

No login scraping. Missing keys → live equals static for that idea.

## Data model

```ts
type Lane =
  | "trading"
  | "affiliate"
  | "ops"
  | "physical"
  | "productized"
  | "content"
  | "marketplace"
  | "automation";

type Capital = "none" | "low" | "medium" | "high";
type Effort = "S" | "M" | "L";
type TimeToCash = "days" | "weeks" | "months";

interface Idea {
  id: string;              // idea-001 … idea-100
  name: string;
  lane: Lane;
  blurb: string;
  capital: Capital;
  effort: Effort;
  timeToCash: TimeToCash;
  automatable: 1 | 2 | 3 | 4 | 5;
  stackFit: 1 | 2 | 3 | 4 | 5;  // fit to existing Rocky stack
  staticScore: number;     // 0–100 precomputed
  liveSignals: Array<"polymarket_volume" | "x_trend" | "affiliate_epc" | "none">;
  buildHint: string;       // one-line next step if picked
}
```

### Static score formula (locked)

```
staticScore = round(
  20 * (automatable/5) +
  25 * (stackFit/5) +
  20 * timeWeight +
  20 * capitalWeight +
  15 * effortWeight
)

timeWeight:    days=1, weeks=0.7, months=0.4
capitalWeight: none=1, low=0.85, medium=0.6, high=0.35
effortWeight:  S=1, M=0.7, L=0.4
```

## UI

1. **Hero:** brand **Idea Arena**, one supporting sentence, CTA “Shortlist top 10”  
2. **Controls:** lane chips, sort (blended score / time-to-cash / capital / stack fit), Static vs Live toggle  
3. **Board:** ranked list/cards for all 100 ideas  
4. **Shortlist rail:** starred ideas; drag or buttons to force-rank top 10  
5. **Top pick panel:** sticky #1 with why-it-ranks + `buildHint`

### Motion (2–3 intentional)

- Rank number fade-in on load  
- Shortlist slide-in when starring  
- Soft score bar fill on mode toggle (static ↔ live)

### Visual direction

Dark operator desk is **avoided by default** (per design rules). Use a cool slate/teal atmosphere with gradient mesh background, expressive display font (not Inter/Roboto/Arial), brand-first hero. No purple-on-white, no cream+terracotta, no broadsheet. Cards only where interaction requires (idea rows / shortlist). Full-bleed atmospheric background, not inset hero media.

## Persistence

`localStorage` keys:

- `arena:stars` — string[] idea ids  
- `arena:top10` — string[] ordered ids (max 10)  
- `arena:scoreMode` — `"static" | "live"`

## Out of scope (v1)

- User accounts  
- Auto-trading / wallet signing  
- Auto-applying to PartnerStack/Admitad/etc.  
- Paid SaaS billing  
- Mobile-native app

## Success criteria

1. All 100 ideas render and sort correctly  
2. Static mode works with zero API keys  
3. Live mode returns without crashing when APIs fail (fallback)  
4. Operator can star and force-rank a top 10; #1 is obvious  
5. Deployed on Vercel from `ugcrocky-dev/income-idea-arena`

## Catalog: 100 ideas

Scores below use the locked formula. Lanes: T=trading, A=affiliate, O=ops, P=physical, R=productized, C=content, M=marketplace, U=automation.

| ID | Name | Lane | Capital | Effort | TTC | Auto | Fit | Score | Live | Build hint |
|----|------|------|---------|--------|-----|------|-----|-------|------|------------|
| 001 | Kalshi Paper Lab | T | low | M | weeks | 5 | 5 | 86 | polymarket_volume | Clone Polymarket lab for Kalshi public markets |
| 002 | Hyperliquid Wallet Race | T | low | M | weeks | 5 | 4 | 82 | none | 100 paper bots copying HL leaderboard wallets |
| 003 | Alpaca Earnings Paper Lab | T | none | M | weeks | 5 | 5 | 90 | none | Wrap earnings-play-radar in paper scoreboard |
| 004 | Breakout Scanner Paper Gate | T | none | M | weeks | 5 | 5 | 90 | none | Wrap full-market-breakout-scanner + 7-day gate |
| 005 | Polymarket↔Kalshi Arb Radar | T | low | L | weeks | 4 | 5 | 78 | polymarket_volume | Alert when cross-venue price gap > fees |
| 006 | FOMO Copy Bot Promoter | T | low | M | weeks | 5 | 5 | 86 | x_trend | Promote FOMO paper winners past 7-day gate |
| 007 | Sports Odds Mispricing Lab | T | low | L | weeks | 4 | 4 | 73 | none | Odds API vs DK/FanDuel/Kalshi lines |
| 008 | Manifold Soft-Market Lab | T | none | S | days | 4 | 3 | 86 | none | Paper bots on Manifold for strategy practice |
| 009 | dYdX Funding Fade Bot | T | medium | L | months | 4 | 3 | 57 | none | Paper fade extreme funding rates |
| 010 | GMX GLP Yield Watch | T | medium | M | months | 3 | 2 | 52 | none | Alert when GLP APR vs risk threshold |
| 011 | Binance-Bybit Basis Radar | T | medium | L | weeks | 4 | 3 | 63 | none | Spot-perp basis paper trades |
| 012 | Options Earnings IV Crush Lab | T | medium | L | months | 4 | 4 | 62 | none | Paper IV crush around earnings calendar |
| 013 | Prediction Category Specialist | T | low | M | weeks | 4 | 5 | 82 | polymarket_volume | Only crypto/sports/politics fee-aware niches |
| 014 | Wallet PNL Digester | T | none | S | days | 5 | 4 | 95 | none | Daily digest of tracked wallets' edge |
| 015 | Liquidation Cascade Alerts | T | none | M | weeks | 4 | 3 | 76 | none | Alert on cascade risk for copy bots |
| 016 | Affiliate Offer Radar | A | none | M | weeks | 5 | 5 | 90 | affiliate_epc | Nightly scan networks; rank easy-approve + EPC |
| 017 | PartnerStack SaaS Hunter | A | none | S | days | 4 | 5 | 96 | affiliate_epc | Auto-list new high-payout SaaS programs |
| 018 | Admitad Adspace Unblocker | A | none | S | days | 3 | 4 | 87 | affiliate_epc | Monitor review status; alert when live |
| 019 | Digistore24 Offer Picker | A | none | M | weeks | 4 | 4 | 80 | affiliate_epc | Rank Digistore offers by gravity + payout |
| 020 | Impact.com Tech Niche Scout | A | none | M | weeks | 4 | 4 | 80 | affiliate_epc | Find VPN/AI/hosting brands with simple apply |
| 021 | FlexOffers Long-Tail EPC | A | none | M | weeks | 3 | 3 | 72 | affiliate_epc | Mine long-tail offers competitors ignore |
| 022 | Comparison Landing Factory | A | low | M | weeks | 5 | 5 | 86 | affiliate_epc | One template site per niche; swap winners |
| 023 | VPN Comparison Microsite | A | low | S | days | 4 | 4 | 88 | affiliate_epc | Ship one VPN compare page + tracking |
| 024 | AI Tools Affiliate Hub | A | low | M | weeks | 4 | 5 | 82 | affiliate_epc | Hub of AI tools with tracked CTAs |
| 025 | Hosting/VPS Deal Desk | A | low | M | weeks | 4 | 4 | 78 | affiliate_epc | Seasonal hosting deal aggregator |
| 026 | LMS / Course Affiliate Desk | A | none | M | weeks | 3 | 3 | 72 | affiliate_epc | Curate course offers by niche |
| 027 | Click → Conversion Tracker | A | none | M | weeks | 5 | 5 | 90 | none | SellStack-style funnel for affiliate links |
| 028 | Offer Kill-Switch Weekly | A | none | S | days | 5 | 4 | 95 | affiliate_epc | Auto-pause links under EPC floor |
| 029 | Geo Offer Router | A | low | M | weeks | 4 | 3 | 72 | affiliate_epc | Route visitors to best payout by country |
| 030 | Coupon Site Automation | A | low | L | months | 4 | 3 | 62 | affiliate_epc | Generate coupon pages from feed |
| 031 | PracticeQ No-Show Chaser | O | none | M | weeks | 5 | 5 | 90 | none | SMS/email chase via RingCentral + Gmail |
| 032 | Clinic Recall Campaign Agent | O | none | M | weeks | 5 | 4 | 84 | none | Overdue recall lists → sequenced outreach |
| 033 | Unpaid Balance Collector | O | none | M | weeks | 4 | 5 | 86 | none | Polite dunning sequences for balances |
| 034 | Lead-to-Book Desk | O | none | M | weeks | 5 | 5 | 90 | x_trend | Inbound X/Gmail/RC → booked appointment |
| 035 | Multi-Clinic Ops Dashboard | O | low | L | months | 4 | 4 | 67 | none | White-label PracticeQ ops cockpit |
| 036 | Review Request Automator | O | none | S | days | 4 | 4 | 91 | none | Post-visit review ask via SMS/email |
| 037 | Insurance Follow-Up Bot | O | none | L | months | 3 | 4 | 66 | none | Track claim statuses; nudge staff |
| 038 | Waitlist Fill Agent | O | none | S | days | 5 | 4 | 95 | none | Auto-offer cancellations to waitlist |
| 039 | Staff Shift Reminder Hub | O | none | S | days | 3 | 3 | 82 | none | RingCentral reminders for clinic shifts |
| 040 | Patient Reactivation Blasts | O | none | M | weeks | 4 | 4 | 80 | none | Segmented win-back campaigns |
| 041 | Urus → Multi-Exotic Radar | P | high | M | months | 4 | 5 | 66 | none | Generalize Urus Radar across models |
| 042 | Exotic Rental Yield Desk | P | high | M | months | 4 | 5 | 66 | none | Buy-box + rental yield + break-even days |
| 043 | Cross-Market Car Arb | P | high | L | months | 3 | 4 | 53 | none | US vs UK/DE/Dubai landed-cost alerts |
| 044 | Peer Rental Pricing Agent | P | medium | M | weeks | 4 | 4 | 72 | none | Dynamic daily rates from utilization |
| 045 | Marketplace Flip Scanner | P | low | M | weeks | 4 | 3 | 72 | none | eBay/FB/CL gaps in 1–2 known niches |
| 046 | Electronics Flip Radar | P | low | M | weeks | 4 | 2 | 68 | none | Price gap alerts for GPUs/phones |
| 047 | Domain Sniper List | P | low | S | days | 3 | 2 | 74 | none | Expired domains matching niches |
| 048 | Storage Unit Arbitrage Map | P | medium | L | months | 2 | 2 | 44 | none | Auction unit ROI estimator |
| 049 | Wholesale Sneaker Spread | P | medium | L | months | 3 | 2 | 48 | none | Spread tracker across sneaker venues |
| 050 | Solar Panel Lead Flip | P | none | M | weeks | 3 | 2 | 66 | none | Buy/sell solar leads with margin rules |
| 051 | Paper Lab as a Product | R | low | L | months | 4 | 5 | 72 | none | White-label bot-race labs monthly |
| 052 | Deal Desk SaaS | R | low | L | months | 4 | 5 | 72 | none | Affiliate + trading + rental in one cockpit |
| 053 | Clinic Ops Agent SaaS | R | low | L | months | 4 | 5 | 72 | none | Sell PracticeQ automation as SaaS |
| 054 | RideStack Yield Product | R | low | M | weeks | 4 | 5 | 82 | none | Productize ride utilization + payouts |
| 055 | SellStack for Affiliates | R | low | M | weeks | 5 | 5 | 86 | affiliate_epc | Productize affiliate scoreboard |
| 056 | Wallet Alert SaaS | R | none | M | weeks | 5 | 4 | 84 | none | Paid alerts for tracked trader wallets |
| 057 | Niche Radar Newsletter Paid | R | none | S | days | 4 | 3 | 86 | x_trend | Paid weekly digests from radars |
| 058 | Template Site Marketplace | R | low | L | months | 3 | 4 | 63 | none | Sell comparison site templates |
| 059 | Automation Playbook Shop | R | none | M | weeks | 3 | 3 | 72 | none | Sell SOP + agent prompts packs |
| 060 | API Wrapper Micro-SaaS | R | none | M | weeks | 4 | 3 | 76 | none | Thin paid API over public data you already use |
| 061 | X Hook Testing Loop | C | none | S | days | 5 | 4 | 95 | x_trend | Auto-post hooks; keep winners |
| 062 | Offer × Hook Matrix | C | none | M | weeks | 5 | 5 | 90 | x_trend | Test offer/hook pairs; kill losers |
| 063 | Thread → Landing Bridge | C | low | M | weeks | 4 | 4 | 78 | x_trend | Threads that deep-link to compare pages |
| 064 | Short-Form Clip Factory | C | low | L | weeks | 3 | 3 | 64 | x_trend | Auto-cut clips from long content |
| 065 | Niche Twitter Lists Engine | C | none | S | days | 4 | 3 | 86 | x_trend | Auto-curate prospect lists |
| 066 | UGC Script Generator Desk | C | none | M | weeks | 4 | 4 | 80 | none | Scripts for affiliate creatives |
| 067 | Competitor Post Remix Alerts | C | none | S | days | 4 | 3 | 86 | x_trend | Alert when competitors' posts spike |
| 068 | SEO Programmatic Pages | C | low | L | months | 4 | 4 | 67 | none | Programmatic niche pages at scale |
| 069 | Email Digests from Radars | C | none | S | days | 5 | 4 | 95 | none | Gmail digests of daily radar hits |
| 070 | Community AMA Funnel | C | none | M | weeks | 2 | 3 | 68 | x_trend | Host AMAs that convert to offers |
| 071 | RideStack Demand Matcher | M | low | M | weeks | 4 | 5 | 82 | none | Match idle cars to demand spikes |
| 072 | Owner Acquisition Funnel | M | low | M | weeks | 3 | 4 | 74 | none | Outbound to exotic owners for supply |
| 073 | Dynamic Pricing for Rentals | M | none | M | weeks | 5 | 5 | 90 | none | Utilization-based price suggestions |
| 074 | Damage Deposit Workflow | M | none | S | days | 3 | 4 | 87 | none | Automate hold/release messaging |
| 075 | Cross-List Sync Agent | M | low | L | months | 4 | 3 | 62 | none | Sync listings across rental platforms |
| 076 | Guest Message Autopilot | M | none | S | days | 4 | 4 | 91 | none | FAQ replies via templates + LLM |
| 077 | Utilization War Room | M | none | M | weeks | 4 | 5 | 86 | none | Single pane for fleet KPIs |
| 078 | Peer-to-Peer Insurance Quote | M | medium | L | months | 2 | 3 | 49 | none | Quote exotic rental insurance options |
| 079 | Local Delivery Gig Router | M | none | M | weeks | 3 | 2 | 66 | none | Route small local delivery jobs |
| 080 | Lead Marketplace for Ops | M | none | M | weeks | 3 | 3 | 72 | none | Buy/sell clinic or rental leads |
| 081 | Gmail Triage → Task Agent | U | none | S | days | 5 | 4 | 95 | none | Label, draft, escalate from Gmail |
| 082 | RingCentral Missed-Call Bot | U | none | S | days | 5 | 4 | 95 | none | Missed call → SMS callback link |
| 083 | Composio Glue Workflows | U | none | M | weeks | 5 | 4 | 84 | none | Pack reusable Composio automations |
| 084 | Daily Operator Brief | U | none | S | days | 5 | 5 | 100 | none | One AM brief: markets, offers, ops |
| 085 | Cron Health Watchdog | U | none | S | days | 5 | 4 | 95 | none | Alert when GitHub Actions radars fail |
| 086 | Credential Expiry Guard | U | none | S | days | 4 | 3 | 86 | none | Remind before API keys/ads expire |
| 087 | Invoice → QuickBooks Sync | U | none | M | weeks | 3 | 2 | 66 | none | Automate invoice ingest |
| 088 | Multi-Agent Run Dispatcher | U | none | M | weeks | 5 | 5 | 90 | none | Queue Cursor agents for radar jobs |
| 089 | Slack/Email Incident Bridge | U | none | S | days | 4 | 3 | 86 | none | Route lab failures to one channel |
| 090 | Browser OTP Relay Desk | U | none | M | weeks | 3 | 4 | 76 | none | Human-in-loop OTP for network logins |
| 091 | Statusphere Verify Autopilot | U | none | S | days | 4 | 3 | 86 | none | Auto-check verification email links |
| 092 | Vercel Deploy Watch + Rollback | U | none | S | days | 4 | 4 | 91 | none | Watch deploys; alert on error spikes |
| 093 | Lead Magnet PDF Factory | C | none | M | weeks | 4 | 3 | 76 | none | Auto-build PDFs from idea winners |
| 094 | Webinar Replay Funnel | C | low | M | weeks | 3 | 3 | 68 | none | Evergreen replay + affiliate CTA |
| 095 | Chrome Extension Deal Clipper | R | none | L | months | 3 | 3 | 61 | none | Clip prices → flip/affiliate desk |
| 096 | Local Service Quote Bot | O | none | M | weeks | 4 | 2 | 70 | none | SMS quote bot for one local niche |
| 097 | Franchise Territory Heatmap | P | medium | L | months | 2 | 2 | 44 | none | Map demand for a franchise bet |
| 098 | Crowdfund Arbitrage Watch | M | low | M | weeks | 3 | 2 | 64 | none | Track resale spreads on hyped drops |
| 099 | AI Support Desk for 1 Niche | R | none | M | weeks | 4 | 3 | 76 | none | Sell chatbot + human escalate |
| 100 | Idea Arena Itself (meta) | R | none | S | days | 5 | 5 | 100 | none | Ship this dashboard; pick #1 next |

## Recommended default shortlist (seed)

If the operator has no stars yet, pre-suggest (by formula score + strategic diversity):

1. 084 Daily Operator Brief (100)  
2. 100 Idea Arena Itself — shipping now (100)  
3. 017 PartnerStack SaaS Hunter (96)  
4. 061 X Hook Testing Loop (95)  
5. 014 Wallet PNL Digester (95)  
6. 003 Alpaca Earnings Paper Lab (90)  
7. 016 Affiliate Offer Radar (90)  
8. 031 PracticeQ No-Show Chaser (90)  
9. 001 Kalshi Paper Lab (86)  
10. 055 SellStack for Affiliates (86)  

## Implementation notes (for plan phase)

- Scaffold Next.js + TypeScript + Tailwind  
- Encode ideas in `data/ideas.json` exactly as catalog  
- Unit-test scoring formula against table scores for a sample of IDs  
- Radar route: try Polymarket; catch errors; return `liveScore` map  
- Deploy Vercel; screenshot shortlist flow for walkthrough

## Spec self-review checklist

- [x] No TBD placeholders in requirements  
- [x] A+B hybrid consistent (static always; live optional)  
- [x] Scope limited to picker dashboard (no trading execution)  
- [x] Score formula unambiguous  
- [x] 100 ideas enumerated with fields needed for UI
