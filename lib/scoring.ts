import type { Capital, Effort, Idea, RankedIdea, ScoreMode, TimeToCash } from "./types";

const TIME_WEIGHT: Record<TimeToCash, number> = {
  days: 1,
  weeks: 0.7,
  months: 0.4,
};

const CAPITAL_WEIGHT: Record<Capital, number> = {
  none: 1,
  low: 0.85,
  medium: 0.6,
  high: 0.35,
};

const EFFORT_WEIGHT: Record<Effort, number> = {
  S: 1,
  M: 0.7,
  L: 0.4,
};

export function computeStaticScore(
  idea: Pick<Idea, "automatable" | "stackFit" | "timeToCash" | "capital" | "effort">,
): number {
  return Math.round(
    20 * (idea.automatable / 5) +
      25 * (idea.stackFit / 5) +
      20 * TIME_WEIGHT[idea.timeToCash] +
      20 * CAPITAL_WEIGHT[idea.capital] +
      15 * EFFORT_WEIGHT[idea.effort],
  );
}

export function blendScore(staticScore: number, liveScore: number): number {
  return Math.round(0.6 * staticScore + 0.4 * liveScore);
}

export function rankIdeas(
  ideas: Idea[],
  mode: ScoreMode,
  liveScores: Record<string, number> = {},
): RankedIdea[] {
  const ranked = ideas.map((idea) => {
    const liveScore =
      mode === "live" && liveScores[idea.id] != null
        ? liveScores[idea.id]
        : idea.staticScore;
    const displayScore =
      mode === "live" ? blendScore(idea.staticScore, liveScore) : idea.staticScore;
    return { ...idea, liveScore, displayScore };
  });

  return ranked.sort((a, b) => {
    if (b.displayScore !== a.displayScore) return b.displayScore - a.displayScore;
    return a.id.localeCompare(b.id);
  });
}

export const SEED_TOP10 = [
  "idea-084",
  "idea-100",
  "idea-017",
  "idea-061",
  "idea-014",
  "idea-003",
  "idea-016",
  "idea-031",
  "idea-001",
  "idea-055",
] as const;
