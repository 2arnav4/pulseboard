import { clsx } from "clsx";
import type { AvatarColor } from "@/types/user";

/** Muted shades from the app palette; white initials keep at least 4.5:1 contrast on each. */
export const AVATAR_CLASSES: Record<AvatarColor, string> = {
  indigo: "bg-[#2b4c7e]",
  emerald: "bg-[#2f6b45]",
  rose: "bg-[#a3341e]",
  amber: "bg-[#85500f]",
  sky: "bg-[#2d5f6b]",
  violet: "bg-[#67397a]",
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
        size === "sm" ? "size-8 text-xs" : "size-16 font-serif text-2xl font-normal",
      )}
    >
      {initialsOf(name)}
    </span>
  );
}
