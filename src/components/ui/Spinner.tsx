import { Loader2 } from "lucide-react";
import { clsx } from "clsx";

interface SpinnerProps {
  label: string;
  className?: string;
}

/** Accessible loading indicator: the label is announced, the icon is decorative. */
export function Spinner({ label, className }: SpinnerProps) {
  return (
    <span role="status" className={clsx("inline-flex items-center gap-2 text-sm text-muted", className)}>
      <Loader2 aria-hidden="true" className="size-5 animate-spin text-accent" />
      <span>{label}</span>
    </span>
  );
}
