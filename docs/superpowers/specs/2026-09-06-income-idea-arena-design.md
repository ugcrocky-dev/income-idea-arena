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

Cool slate/teal atmosphere with gradient mesh background, expressive display font (not Inter/Roboto/Arial), brand-first hero. No purple-on-white, no cream+terracotta, no broadsheet. Cards only where interaction requires (idea rows / shortlist). Full-bleed atmospheric background, not inset hero media.

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

See repository file for the full scored table of 100 ideas (trading, affiliate, ops, physical, productized, content, marketplace, automation) plus recommended default shortlist.

Full catalog is maintained in this path in the working tree and will be expanded in the implementation commit with complete blurbs in `data/ideas.json`.

## Recommended default shortlist (seed)

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
