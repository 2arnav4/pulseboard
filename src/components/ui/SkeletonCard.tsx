import { clsx } from "clsx";

/** Placeholder with a shimmer while content loads; hidden from screen readers (a Spinner announces loading). */
export function SkeletonCard({ layout = "grid" }: { layout?: "grid" | "row" }) {
  return (
    <div
      aria-hidden="true"
      className={clsx(
        "relative overflow-hidden rounded-2xl border border-border bg-surface p-4",
        layout === "row" ? "flex gap-4" : "flex flex-col gap-3",
      )}
    >
      <div className={clsx("rounded-xl bg-surface-2", layout === "row" ? "h-24 w-32 shrink-0" : "aspect-video w-full")} />
      <div className="flex flex-1 flex-col gap-2">
        <div className="h-3 w-20 rounded bg-surface-2" />
        <div className="h-4 w-11/12 rounded bg-surface-2" />
        <div className="h-4 w-2/3 rounded bg-surface-2" />
      </div>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </div>
  );
}
