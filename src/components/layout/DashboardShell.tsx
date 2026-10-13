"use client";

import { useCallback, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { useClientStateSync } from "@/hooks/useClientStateSync";
import { useIsClient } from "@/hooks/useIsClient";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

/** Sidebar + header frame around every dashboard page; also owns persistence for the signed-in user. */
export function DashboardShell({ userId, children }: { userId: string; children: ReactNode }) {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  useClientStateSync(userId);
  // Page content depends on state loaded from localStorage, which the server cannot see. It sits
  // in a separate Suspense boundary that hydrates after that state loads, and React 19 does not
  // patch mismatched attributes (e.g. aria-checked), so pages render only after mount.
  const isClient = useIsClient();

  return (
    <div className="flex min-h-screen">
      <a
        href="#main-content"
        className="sr-only z-50 rounded-full bg-ink px-4 py-2 text-ink-contrast focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        {t("app.skipToContent")}
      </a>
      <Sidebar mobileOpen={menuOpen} onClose={closeMenu} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header onOpenMenu={() => setMenuOpen(true)} menuOpen={menuOpen} />
        <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 focus:outline-none sm:px-8 lg:py-12">
          {isClient ? (
            children
          ) : (
            <div aria-hidden="true" className="flex flex-col gap-4">
              {Array.from({ length: 3 }, (_, index) => (
                <SkeletonCard key={index} layout="row" />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
