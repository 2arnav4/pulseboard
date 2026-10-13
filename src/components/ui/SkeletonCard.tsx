import { clsx } from "clsx";

/** Placeholder while content loads; hidden from screen readers (a Spinner announces loading). */
export function SkeletonCard({ layout = "grid" }: { layout?: "grid" | "row" }) {
  return (
    <div
      aria-hidden="true"
      className={clsx(
        "animate-pulse rounded-3xl border border-border bg-surface p-4",
        layout === "row" ? "flex gap-5" : "flex flex-col gap-3",
      )}
    >
      <div className={clsx("rounded-2xl bg-surface-2", layout === "row" ? "h-28 w-40 shrink-0" : "aspect-video w-full")} />
      <div className="flex flex-1 flex-col gap-2.5 py-1">
        <div className="h-2.5 w-24 rounded-full bg-surface-2" />
        <div className="h-4 w-11/12 rounded-full bg-surface-2" />
        <div className="h-4 w-2/3 rounded-full bg-surface-2" />
      </div>
    </div>
  );
}
