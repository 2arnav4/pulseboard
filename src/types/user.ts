export const AVATAR_COLORS = ["indigo", "emerald", "rose", "amber", "sky", "violet"] as const;
export type AvatarColor = (typeof AVATAR_COLORS)[number];
