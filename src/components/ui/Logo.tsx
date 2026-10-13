import { clsx } from "clsx";

/** Monogram plus wordmark. The mark is a plain "P" cut from an ink square, no pictogram. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={clsx("inline-flex items-center gap-2", className)}>
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6 shrink-0 text-ink">
        <rect width="24" height="24" rx="6" fill="currentColor" />
        <path
          d="M8.5 17.5V6.5h4.25a3.25 3.25 0 0 1 0 6.5H8.5"
          className="stroke-ink-contrast"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      <span className="text-[1.05rem] font-semibold tracking-tight">Pulseboard</span>
    </span>
  );
}
