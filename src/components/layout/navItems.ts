import { Flame, Heart, LayoutDashboard, Search, Settings, User, type LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  labelKey: "nav.feed" | "nav.trending" | "nav.favorites" | "nav.search" | "nav.settings" | "nav.profile";
  icon: LucideIcon;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { href: "/", labelKey: "nav.feed", icon: LayoutDashboard },
  { href: "/trending", labelKey: "nav.trending", icon: Flame },
  { href: "/favorites", labelKey: "nav.favorites", icon: Heart },
  { href: "/search", labelKey: "nav.search", icon: Search },
  { href: "/settings", labelKey: "nav.settings", icon: Settings },
  { href: "/profile", labelKey: "nav.profile", icon: User },
];
