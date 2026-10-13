import { clsx } from "clsx";

interface SpinnerProps {
  label: string;
  className?: string;
}

/** Accessible loading indicator: the label is announced, the ring is decorative. */
export function Spinner({ label, className }: SpinnerProps) {
  return (
    <span role="status" className={clsx("inline-flex items-center gap-2.5 text-sm text-muted", className)}>
      <span aria-hidden="true" className="size-4 animate-spin rounded-full border-[1.5px] border-border border-t-text" />
      <span>{label}</span>
    </span>
  );
}
