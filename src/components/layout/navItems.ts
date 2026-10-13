export interface NavItem {
  href: string;
  labelKey: "nav.feed" | "nav.trending" | "nav.favorites" | "nav.search" | "nav.settings" | "nav.profile";
}

/** Reading sections first, account sections after a divider (see Sidebar). */
export const NAV_ITEMS: readonly NavItem[] = [
  { href: "/", labelKey: "nav.feed" },
  { href: "/trending", labelKey: "nav.trending" },
  { href: "/favorites", labelKey: "nav.favorites" },
  { href: "/search", labelKey: "nav.search" },
];

export const ACCOUNT_NAV_ITEMS: readonly NavItem[] = [
  { href: "/settings", labelKey: "nav.settings" },
  { href: "/profile", labelKey: "nav.profile" },
];
