"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { clsx } from "clsx";
import { CloseGlyph } from "@/components/ui/icons";
import { Logo } from "@/components/ui/Logo";
import { useAppSelector } from "@/store/hooks";
import { ACCOUNT_NAV_ITEMS, NAV_ITEMS, type NavItem } from "./navItems";

function NavList({ items, onNavigate, large }: { items: readonly NavItem[]; onNavigate?: () => void; large?: boolean }) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const favoriteCount = useAppSelector((state) => state.favorites.items.length);

  return (
    <ul className="flex flex-col">
      {items.map(({ href, labelKey }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <li key={href}>
            <Link
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={clsx(
                "relative flex items-center gap-3 pl-4 transition-colors",
                large ? "min-h-14 font-serif text-3xl" : "min-h-10 text-[0.95rem]",
                active ? "font-medium text-text" : "text-muted hover:text-text",
              )}
            >
              {active && (
                <motion.span
                  layoutId={large ? "nav-active-mobile" : "nav-active"}
                  aria-hidden="true"
                  className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-accent"
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />
              )}
              <span>{t(labelKey)}</span>
              {href === "/favorites" && favoriteCount > 0 && (
                <span className="num ml-auto text-xs text-muted">{favoriteCount}</span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function NavSections({ onNavigate, large }: { onNavigate?: () => void; large?: boolean }) {
  const { t } = useTranslation();
  return (
    <nav aria-label={t("nav.mainNav")} className="flex flex-col gap-6">
      <NavList items={NAV_ITEMS} onNavigate={onNavigate} large={large} />
      <div className="border-t border-border pt-6">
        <NavList items={ACCOUNT_NAV_ITEMS} onNavigate={onNavigate} large={large} />
      </div>
    </nav>
  );
}

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const { t } = useTranslation();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!mobileOpen) return;
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen, onClose]);

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col gap-10 border-r border-border px-6 py-6 lg:flex">
        <Link href="/" aria-label={t("app.name")} className="self-start">
          <Logo />
        </Link>
        <NavSections />
        <p className="mt-auto text-xs leading-relaxed text-muted">{t("app.tagline")}</p>
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <motion.div
              className="absolute inset-0 bg-ink/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              aria-hidden="true"
            />
            <motion.div
              id="mobile-nav"
              role="dialog"
              aria-modal="true"
              aria-label={t("nav.mainNav")}
              className="absolute inset-y-0 left-0 flex w-80 max-w-[85vw] flex-col gap-10 border-r border-border bg-bg px-6 py-5"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 40 }}
            >
              <div className="flex items-center justify-between">
                <Logo />
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={onClose}
                  aria-label={t("nav.closeMenu")}
                  className="-mr-2 grid size-10 place-items-center rounded-full hover:bg-surface-2"
                >
                  <CloseGlyph className="size-5" />
                </button>
              </div>
              <NavSections onNavigate={onClose} large />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
