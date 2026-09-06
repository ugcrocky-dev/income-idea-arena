# Income Idea Arena Implementation Plan

> **For agentic workers:** Execute task-by-task. Steps use checkbox syntax.

**Goal:** Ship a Next.js Idea Arena dashboard with 100 scored ideas, static+live ranking, shortlist/top-10 picker, deployed on Vercel.

**Architecture:** App Router client UI over `data/ideas.json`; `/api/radar` blends optional Polymarket volume into live scores; localStorage persists stars/top10/mode.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS 4, Google fonts (Syne + Source Serif 4), Vitest for scoring tests.

## Global Constraints

- Blended score: `0.6 * static + 0.4 * live` when live available; else static
- Static formula locked in design spec
- No auth, trading execution, or affiliate auto-apply
- Brand-first hero; cool slate/teal; no purple/cream/terracotta/Inter defaults
- Branch: `cursor/income-idea-arena-d53b`

---

### Task 1: Scaffold Next.js app

**Files:**
- Create: `package.json`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `vitest.config.ts`

- [ ] Run `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --turbopack --yes` in `/agent/income-idea-arena` (keep existing `docs/`)
- [ ] Add vitest + happy-dom as devDeps
- [ ] Commit scaffold

### Task 2: Ideas catalog + scoring lib

**Files:**
- Create: `data/ideas.json`, `lib/types.ts`, `lib/scoring.ts`, `lib/scoring.test.ts`

- [ ] Encode all 100 ideas from the design spec catalog into JSON (`id` = `idea-001` … `idea-100`)
- [ ] Implement `computeStaticScore`, `blendScore`, weights matching spec
- [ ] Test: sample IDs 084→100, 017→96, 001→86
- [ ] Commit

### Task 3: Radar API

**Files:**
- Create: `app/api/radar/route.ts`

- [ ] GET fetches Polymarket volume (gamma API); on failure return `{ ok:false, liveScores:{} }`
- [ ] For ideas with `polymarket_volume`, map volume percentile → 0–100 live score; others live=static
- [ ] Commit

### Task 4: Idea Arena UI

**Files:**
- Modify: `app/layout.tsx`, `app/globals.css`, `app/page.tsx`
- Create: `components/Arena.tsx`, `components/IdeaRow.tsx`, `components/Shortlist.tsx`, `components/TopPick.tsx`

- [ ] Hero brand Idea Arena + CTA
- [ ] Filters, sort, static/live toggle
- [ ] Star → shortlist; force-rank top 10; sticky #1 panel
- [ ] localStorage keys per spec
- [ ] Commit

### Task 5: Verify + deploy

- [ ] `npm test` and `npm run build` pass
- [ ] Push branch via GitHub MCP
- [ ] Deploy Vercel preview/production
- [ ] Capture screenshot walkthrough artifact
