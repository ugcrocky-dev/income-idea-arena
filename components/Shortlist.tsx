import type { RankedIdea } from "@/lib/types";

export function Shortlist({
  ids,
  byId,
  onMove,
  onRemove,
}: {
  ids: string[];
  byId: Map<string, RankedIdea>;
  onMove: (id: string, dir: -1 | 1) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <section className="slide-rail rounded-[1.5rem] border border-[var(--line)] bg-white/70 p-4 backdrop-blur-md">
      <div className="mb-3 flex items-center justify-between">
        <h3
          className="text-sm font-bold tracking-wide text-[var(--ink)] uppercase"
          style={{ fontFamily: "var(--font-display), sans-serif" }}
        >
          Top 10 shortlist
        </h3>
        <span className="text-xs text-[var(--muted)]">{ids.length}/10</span>
      </div>
      <ol className="space-y-2">
        {ids.length === 0 ? (
          <li className="text-sm text-[var(--muted)]">Star ideas or seed the shortlist.</li>
        ) : (
          ids.map((id, index) => {
            const idea = byId.get(id);
            if (!idea) return null;
            return (
              <li
                key={id}
                className="flex items-center gap-2 rounded-xl border border-[var(--line)] bg-white/80 px-2 py-2"
              >
                <span
                  className="w-6 text-center text-sm font-bold text-[var(--accent)]"
                  style={{ fontFamily: "var(--font-display), sans-serif" }}
                >
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-[var(--ink)]">{idea.name}</div>
                  <div className="text-[11px] text-[var(--muted)]">score {idea.displayScore}</div>
                </div>
                <div className="flex flex-col gap-1">
                  <button type="button" aria-label="Move up" onClick={() => onMove(id, -1)} className="rounded bg-[rgba(16,36,31,0.06)] px-1.5 text-xs">↑</button>
                  <button type="button" aria-label="Move down" onClick={() => onMove(id, 1)} className="rounded bg-[rgba(16,36,31,0.06)] px-1.5 text-xs">↓</button>
                </div>
                <button type="button" aria-label="Remove" onClick={() => onRemove(id)} className="rounded px-1.5 text-xs text-[var(--accent-2)]">✕</button>
              </li>
            );
          })
        )}
      </ol>
    </section>
  );
}
