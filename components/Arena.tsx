"use client";

import { useEffect, useMemo, useState } from "react";
import ideasData from "@/data/ideas.json";
import { IdeaRow } from "@/components/IdeaRow";
import { Shortlist } from "@/components/Shortlist";
import { TopPick } from "@/components/TopPick";
import { SEED_TOP10, rankIdeas } from "@/lib/scoring";
import type { Idea, Lane, RankedIdea, ScoreMode } from "@/lib/types";

const ideas = ideasData as Idea[];

const LANES: Array<Lane | "all"> = [
  "all",
  "trading",
  "affiliate",
  "ops",
  "physical",
  "productized",
  "content",
  "marketplace",
  "automation",
];

type SortKey = "score" | "time" | "capital" | "fit";

const STORAGE = {
  stars: "arena:stars",
  top10: "arena:top10",
  mode: "arena:scoreMode",
} as const;

const TIME_ORDER = { days: 0, weeks: 1, months: 2 } as const;
const CAPITAL_ORDER = { none: 0, low: 1, medium: 2, high: 3 } as const;

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function Arena() {
  const [mode, setMode] = useState<ScoreMode>("static");
  const [lane, setLane] = useState<Lane | "all">("all");
  const [sort, setSort] = useState<SortKey>("score");
  const [stars, setStars] = useState<string[]>([]);
  const [top10, setTop10] = useState<string[]>([...SEED_TOP10]);
  const [liveScores, setLiveScores] = useState<Record<string, number>>({});
  const [radarOk, setRadarOk] = useState<boolean | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setStars(loadJson<string[]>(STORAGE.stars, []));
    setTop10(loadJson<string[]>(STORAGE.top10, [...SEED_TOP10]));
    setMode(loadJson<ScoreMode>(STORAGE.mode, "static"));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE.stars, JSON.stringify(stars));
  }, [stars, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE.top10, JSON.stringify(top10));
  }, [top10, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE.mode, JSON.stringify(mode));
  }, [mode, hydrated]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/radar");
        const data = (await res.json()) as {
          ok: boolean;
          liveScores: Record<string, number>;
        };
        if (cancelled) return;
        setLiveScores(data.liveScores ?? {});
        setRadarOk(Boolean(data.ok));
      } catch {
        if (!cancelled) setRadarOk(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const ranked = useMemo(() => {
    let list = rankIdeas(ideas, mode, liveScores);
    if (lane !== "all") list = list.filter((idea) => idea.lane === lane);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (idea) =>
          idea.name.toLowerCase().includes(q) ||
          idea.blurb.toLowerCase().includes(q) ||
          idea.buildHint.toLowerCase().includes(q),
      );
    }
    if (sort === "time") {
      list = [...list].sort(
        (a, b) =>
          TIME_ORDER[a.timeToCash] - TIME_ORDER[b.timeToCash] ||
          b.displayScore - a.displayScore,
      );
    } else if (sort === "capital") {
      list = [...list].sort(
        (a, b) =>
          CAPITAL_ORDER[a.capital] - CAPITAL_ORDER[b.capital] ||
          b.displayScore - a.displayScore,
      );
    } else if (sort === "fit") {
      list = [...list].sort(
        (a, b) => b.stackFit - a.stackFit || b.displayScore - a.displayScore,
      );
    }
    return list;
  }, [mode, liveScores, lane, sort, query]);

  const byId = useMemo(() => {
    const map = new Map<string, RankedIdea>();
    for (const idea of rankIdeas(ideas, mode, liveScores)) {
      map.set(idea.id, idea);
    }
    return map;
  }, [mode, liveScores]);

  const topPick = byId.get(top10[0] ?? "") ?? ranked[0];

  function toggleStar(id: string) {
    setStars((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      setTop10((current) => {
        if (next.includes(id) && !current.includes(id) && current.length < 10) {
          return [...current, id];
        }
        if (!next.includes(id)) return current.filter((x) => x !== id);
        return current;
      });
      return next;
    });
  }

  function addToTop10(id: string) {
    setTop10((prev) => {
      if (prev.includes(id)) return prev;
      if (prev.length >= 10) return [...prev.slice(0, 9), id];
      return [...prev, id];
    });
    setStars((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }

  function moveTop(id: string, dir: -1 | 1) {
    setTop10((prev) => {
      const idx = prev.indexOf(id);
      if (idx < 0) return prev;
      const next = [...prev];
      const swap = idx + dir;
      if (swap < 0 || swap >= next.length) return prev;
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return next;
    });
  }

  function removeTop(id: string) {
    setTop10((prev) => prev.filter((x) => x !== id));
  }

  function seedShortlist() {
    setTop10([...SEED_TOP10]);
    setStars((prev) => Array.from(new Set([...prev, ...SEED_TOP10])));
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 pt-8 pb-20 sm:px-6 lg:px-8">
      <header className="relative overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[var(--panel)] px-6 py-10 shadow-[0_20px_60px_var(--glow)] backdrop-blur-md sm:px-10">
        <p
          className="text-sm font-semibold tracking-[0.22em] text-[var(--accent)] uppercase"
          style={{ fontFamily: "var(--font-display), sans-serif" }}
        >
          Idea Arena
        </p>
        <h1
          className="mt-3 max-w-3xl text-4xl leading-[1.05] font-extrabold tracking-tight text-[var(--ink)] sm:text-6xl"
          style={{ fontFamily: "var(--font-display), sans-serif" }}
        >
          Pick the next money machine.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-[var(--muted)]">
          One hundred automate-and-earn ideas. Rank by stack fit, shortlist ten, then build the
          winner — same gate pattern as your paper labs.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={seedShortlist}
            className="rounded-full bg-[var(--ink)] px-5 py-2.5 text-sm font-semibold text-[#f4faf8] transition hover:bg-[var(--accent)]"
          >
            Shortlist top 10
          </button>
          <button
            type="button"
            onClick={() => setMode((m) => (m === "static" ? "live" : "static"))}
            className="rounded-full border border-[var(--line)] bg-white/70 px-5 py-2.5 text-sm font-semibold text-[var(--ink)]"
          >
            Score mode: {mode === "static" ? "Static" : "Live radar"}
          </button>
          <span className="self-center text-sm text-[var(--muted)]">
            Radar {radarOk == null ? "warming…" : radarOk ? "live" : "fallback"}
          </span>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {LANES.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setLane(item)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold tracking-wide uppercase ${
                  lane === item
                    ? "bg-[var(--accent)] text-white"
                    : "border border-[var(--line)] bg-white/60 text-[var(--muted)]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search ideas…"
              className="min-w-[200px] flex-1 rounded-2xl border border-[var(--line)] bg-white/70 px-4 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
            />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-2xl border border-[var(--line)] bg-white/70 px-4 py-2.5 text-sm"
            >
              <option value="score">Sort: score</option>
              <option value="time">Sort: time to cash</option>
              <option value="capital">Sort: capital</option>
              <option value="fit">Sort: stack fit</option>
            </select>
          </div>

          <div className="overflow-hidden rounded-[1.5rem] border border-[var(--line)] bg-white/65 backdrop-blur-sm">
            {ranked.map((idea, index) => (
              <IdeaRow
                key={idea.id}
                idea={idea}
                rank={index + 1}
                starred={stars.includes(idea.id)}
                inTop={top10.includes(idea.id)}
                onToggleStar={() => toggleStar(idea.id)}
                onAddTop={() => addToTop10(idea.id)}
              />
            ))}
          </div>
        </section>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          {topPick ? <TopPick idea={topPick} mode={mode} /> : null}
          <Shortlist ids={top10} byId={byId} onMove={moveTop} onRemove={removeTop} />
        </aside>
      </div>
    </main>
  );
}
