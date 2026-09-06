import type { RankedIdea } from "@/lib/types";

export function IdeaRow({
  idea,
  rank,
  starred,
  inTop,
  onToggleStar,
  onAddTop,
}: {
  idea: RankedIdea;
  rank: number;
  starred: boolean;
  inTop: boolean;
  onToggleStar: () => void;
  onAddTop: () => void;
}) {
  return (
    <article
      className="rank-in grid grid-cols-[48px_1fr_auto] items-center gap-3 border-b border-[var(--line)] px-4 py-3 last:border-b-0 sm:grid-cols-[56px_1fr_120px_auto]"
      style={{ animationDelay: `${Math.min(rank, 12) * 20}ms` }}
    >
      <div
        className="text-center text-lg font-bold text-[var(--accent)]"
        style={{ fontFamily: "var(--font-display), sans-serif" }}
      >
        {rank}
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3
            className="truncate text-base font-bold text-[var(--ink)]"
            style={{ fontFamily: "var(--font-display), sans-serif" }}
          >
            {idea.name}
          </h3>
          <span className="rounded-full bg-[var(--glow)] px-2 py-0.5 text-[10px] font-semibold tracking-wide text-[var(--accent)] uppercase">
            {idea.lane}
          </span>
        </div>
        <p className="mt-0.5 line-clamp-2 text-sm text-[var(--muted)]">{idea.blurb}</p>
        <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-[var(--muted)]">
          <span>cap {idea.capital}</span>
          <span>·</span>
          <span>effort {idea.effort}</span>
          <span>·</span>
          <span>{idea.timeToCash}</span>
          <span>·</span>
          <span>fit {idea.stackFit}/5</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[rgba(16,36,31,0.08)]">
          <div
            className="score-fill h-full rounded-full bg-[var(--accent)]"
            style={{ width: `${idea.displayScore}%` }}
          />
        </div>
      </div>
      <div
        className="hidden text-right sm:block"
        style={{ fontFamily: "var(--font-display), sans-serif" }}
      >
        <div className="text-2xl font-extrabold text-[var(--ink)]">{idea.displayScore}</div>
        <div className="text-[10px] tracking-wide text-[var(--muted)] uppercase">score</div>
      </div>
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={onToggleStar}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
            starred
              ? "bg-[var(--accent-2)] text-white"
              : "border border-[var(--line)] bg-white/80 text-[var(--ink)]"
          }`}
        >
          {starred ? "Starred" : "Star"}
        </button>
        <button
          type="button"
          onClick={onAddTop}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
            inTop
              ? "border border-[var(--accent)] text-[var(--accent)]"
              : "border border-[var(--line)] bg-white/80 text-[var(--ink)]"
          }`}
        >
          {inTop ? "In top 10" : "Top 10"}
        </button>
      </div>
    </article>
  );
}
