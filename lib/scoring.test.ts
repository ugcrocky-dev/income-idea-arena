import { describe, expect, it } from "vitest";
import ideas from "../data/ideas.json";
import { blendScore, computeStaticScore, rankIdeas } from "./scoring";
import type { Idea } from "./types";

const catalog = ideas as Idea[];

describe("computeStaticScore", () => {
  it("matches catalog scores for key ideas", () => {
    for (const id of ["idea-084", "idea-017", "idea-001", "idea-048"]) {
      const idea = catalog.find((i) => i.id === id)!;
      expect(computeStaticScore(idea)).toBe(idea.staticScore);
    }
  });

  it("scores Daily Operator Brief at 100", () => {
    const idea = catalog.find((i) => i.id === "idea-084")!;
    expect(idea.name).toContain("Daily");
    expect(computeStaticScore(idea)).toBe(100);
  });
});

describe("blendScore", () => {
  it("uses 0.6 static + 0.4 live", () => {
    expect(blendScore(100, 50)).toBe(80);
  });
});

describe("rankIdeas", () => {
  it("orders by static score in static mode", () => {
    const ranked = rankIdeas(catalog, "static");
    expect(ranked[0].id).toBe("idea-084");
    expect(ranked[0].displayScore).toBe(100);
  });

  it("blends live scores when mode is live", () => {
    const ranked = rankIdeas(catalog, "live", { "idea-001": 100 });
    const row = ranked.find((i) => i.id === "idea-001")!;
    expect(row.displayScore).toBe(blendScore(row.staticScore, 100));
  });
});
