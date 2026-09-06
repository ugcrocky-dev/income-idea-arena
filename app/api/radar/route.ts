import { NextResponse } from "next/server";
import ideas from "../../../data/ideas.json";
import type { Idea } from "../../../lib/types";

export const dynamic = "force-dynamic";

type Market = {
  volumeNum?: number;
  volume24hr?: number;
  volume?: string | number;
};

async function fetchPolymarketHeat(): Promise<number | null> {
  try {
    const res = await fetch(
      "https://gamma-api.polymarket.com/markets?limit=50&active=true&closed=false",
      { next: { revalidate: 300 } },
    );
    if (!res.ok) return null;
    const markets = (await res.json()) as Market[];
    if (!Array.isArray(markets) || markets.length === 0) return null;
    const volumes = markets.map((m) => {
      const raw = m.volumeNum ?? m.volume24hr ?? m.volume ?? 0;
      return typeof raw === "string" ? Number(raw) || 0 : Number(raw) || 0;
    });
    const avg = volumes.reduce((a, b) => a + b, 0) / volumes.length;
    return Math.max(40, Math.min(100, Math.round(40 + Math.log10(avg + 1) * 12)));
  } catch {
    return null;
  }
}

export async function GET() {
  const catalog = ideas as Idea[];
  const liveScores: Record<string, number> = {};
  let polymarketHeat: number | null = null;
  let ok = true;

  try {
    polymarketHeat = await fetchPolymarketHeat();
  } catch {
    ok = false;
  }

  for (const idea of catalog) {
    if (idea.liveSignals.includes("polymarket_volume") && polymarketHeat != null) {
      liveScores[idea.id] = polymarketHeat;
    } else if (idea.liveSignals.includes("affiliate_epc")) {
      liveScores[idea.id] = Math.min(100, idea.staticScore + 2);
    } else {
      liveScores[idea.id] = idea.staticScore;
    }
  }

  if (polymarketHeat == null) ok = false;

  return NextResponse.json({
    ok,
    fetchedAt: new Date().toISOString(),
    polymarketHeat,
    liveScores,
  });
}
