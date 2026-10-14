"use client";

import { createAvatar } from "@dicebear/core";
import * as funEmoji from "@dicebear/fun-emoji";
import { clsx } from "clsx";
import { useMemo } from "react";
import type { AvatarColor } from "@/types/user";

/** Background behind the face. Light tints so the dark face strokes stay readable. */
export const AVATAR_HEX: Record<AvatarColor, string> = {
  indigo: "8b9cf7",
  emerald: "71cf62",
  rose: "f79292",
  amber: "fcbc34",
  sky: "5bc0f8",
  violet: "d08bf0",
};

// Only clearly happy expressions: the style's full set includes sick, sad and crying faces,
// and its smaller smiles read as unsure at header size.
const HAPPY_EYES: funEmoji.Options["eyes"] = ["cute", "wink", "closed", "love", "stars", "shades", "glasses"];
const HAPPY_MOUTHS: funEmoji.Options["mouth"] = ["wideSmile", "smileTeeth", "smileLol", "cute", "tongueOut"];

/**
 * Emoji face generated locally from the seed (no network request), so the same name always
 * gets the same face and the SVG never leaves the browser.
 */
export function avatarDataUri(seed: string, color: AvatarColor): string {
  return createAvatar(funEmoji, {
    seed,
    backgroundColor: [AVATAR_HEX[color]],
    eyes: HAPPY_EYES,
    mouth: HAPPY_MOUTHS,
    radius: 50,
  }).toDataUri();
}

interface AvatarProps {
  name: string;
  color: AvatarColor;
  size?: "sm" | "md" | "lg";
}

const SIZES = { sm: "size-8", md: "size-10", lg: "size-16" } as const;

export function Avatar({ name, color, size = "sm" }: AvatarProps) {
  const src = useMemo(() => avatarDataUri(name.trim() || "?", color), [name, color]);
  // eslint-disable-next-line @next/next/no-img-element -- inline SVG data URI; the image optimizer adds nothing here
  return <img src={src} alt="" aria-hidden="true" className={clsx("shrink-0 rounded-full", SIZES[size])} />;
}
