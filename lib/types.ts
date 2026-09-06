export type Lane =
  | "trading"
  | "affiliate"
  | "ops"
  | "physical"
  | "productized"
  | "content"
  | "marketplace"
  | "automation";

export type Capital = "none" | "low" | "medium" | "high";
export type Effort = "S" | "M" | "L";
export type TimeToCash = "days" | "weeks" | "months";
export type LiveSignal =
  | "polymarket_volume"
  | "x_trend"
  | "affiliate_epc"
  | "none";

export type ScoreMode = "static" | "live";

export interface Idea {
  id: string;
  name: string;
  lane: Lane;
  blurb: string;
  capital: Capital;
  effort: Effort;
  timeToCash: TimeToCash;
  automatable: 1 | 2 | 3 | 4 | 5;
  stackFit: 1 | 2 | 3 | 4 | 5;
  staticScore: number;
  liveSignals: LiveSignal[];
  buildHint: string;
}

export interface RankedIdea extends Idea {
  liveScore: number;
  displayScore: number;
}
