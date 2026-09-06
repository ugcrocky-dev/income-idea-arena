import type { RankedIdea, ScoreMode } from "@/lib/types";

export function TopPick({ idea, mode }: { idea: RankedIdea; mode: ScoreMode }) {
  return (
    <section className="slide-rail rounded-[1.5rem] border border-[var(--line)] bg-[var(--panel)] p-5 shadow-[0_12px_40px_var(--glow)] backdrop-blur-md">
      <p className="text-[11px] font-semibold tracking-[0.18em] text-[var(--accent)] uppercase">
        Top pick · {mode}
      </p>
      <h2
        className="mt-2 text-2xl leading-tight font-extrabold text-[var(--ink)]"
        style={{ fontFamily: "var(--font-display), sans-serif" }}
      >
        {idea.name}
      </h2>
      <p className="mt-2 text-sm text-[var(--muted)]">{idea.blurb}</p>
      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <div
            className="text-4xl font-extrabold text-[var(--accent)]"
            style={{ fontFamily: "var(--font-display), sans-serif" }}
          >
            {idea.displayScore}
          </div>
          <div className="text-xs text-[var(--muted)]">
            static {idea.staticScore}
            {mode === "live" ? ` · live ${idea.liveScore}` : ""}
          </div>
        </div>
        <div className="text-right text-xs text-[var(--muted)]">
          <div>{idea.lane}</div>
          <div>
            {idea.capital} capital · {idea.timeToCash}
          </div>
        </div>
      </div>
      <p className="mt-4 rounded-2xl bg-[rgba(15,122,108,0.08)] px-3 py-3 text-sm text-[var(--ink)]">
        <strong>Build next:</strong> {idea.buildHint}
      </p>
    </section>
  );
}
