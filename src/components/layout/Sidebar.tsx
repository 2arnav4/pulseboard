"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X, Zap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { clsx } from "clsx";
import { useAppSelector } from "@/store/hooks";
import { NAV_ITEMS } from "./navItems";

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const favoriteCount = useAppSelector((state) => state.favorites.items.length);

  return (
    <ul className="flex flex-col gap-1">
      {NAV_ITEMS.map(({ href, labelKey, icon: Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <li key={href}>
            <Link
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={clsx(
                "relative flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors",
                active ? "text-accent" : "text-muted hover:bg-surface-2 hover:text-text",
              )}
            >
              {active && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-xl bg-accent-soft"
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />
              )}
              <Icon aria-hidden="true" className="relative size-5" />
              <span className="relative">{t(labelKey)}</span>
              {href === "/favorites" && favoriteCount > 0 && (
                <span className="relative ml-auto rounded-full bg-accent px-2 text-xs text-accent-contrast">{favoriteCount}</span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function Brand() {
  const { t } = useTranslation();
  return (
    <Link href="/" className="flex items-center gap-2 px-3 text-lg font-bold tracking-tight">
      <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-contrast">
        <Zap aria-hidden="true" className="size-5" />
      </span>
      {t("app.name")}
    </Link>
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
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-6 border-r border-border bg-surface py-5 lg:flex">
        <Brand />
        <nav aria-label={t("nav.mainNav")} className="px-3">
          <NavLinks />
        </nav>
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <motion.div
              className="absolute inset-0 bg-black/50"
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
              className="absolute inset-y-0 left-0 flex w-72 flex-col gap-6 bg-surface py-5 shadow-xl"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 40 }}
            >
              <div className="flex items-center justify-between pr-3">
                <Brand />
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={onClose}
                  aria-label={t("nav.closeMenu")}
                  className="inline-flex size-10 items-center justify-center rounded-lg hover:bg-surface-2"
                >
                  <X aria-hidden="true" className="size-5" />
                </button>
              </div>
              <nav aria-label={t("nav.mainNav")} className="px-3">
                <NavLinks onNavigate={onClose} />
              </nav>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
