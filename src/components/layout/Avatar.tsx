import { clsx } from "clsx";
import type { AvatarColor } from "@/types/user";

/** Background shades chosen so white initials keep at least 4.5:1 contrast. */
export const AVATAR_CLASSES: Record<AvatarColor, string> = {
  indigo: "bg-indigo-600",
  emerald: "bg-emerald-700",
  rose: "bg-rose-600",
  amber: "bg-amber-700",
  sky: "bg-sky-700",
  violet: "bg-violet-600",
};

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : (parts[0] ?? "?").slice(0, 2);
  return letters.toUpperCase();
}

interface AvatarProps {
  name: string;
  color: AvatarColor;
  size?: "sm" | "lg";
}

export function Avatar({ name, color, size = "sm" }: AvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={clsx(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white",
        AVATAR_CLASSES[color],
        size === "sm" ? "size-9 text-sm" : "size-16 text-xl",
      )}
    >
      {initialsOf(name)}
    </span>
  );
}
