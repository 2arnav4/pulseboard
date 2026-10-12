"use client";

import { useCallback, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useClientStateSync } from "@/hooks/useClientStateSync";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

/** Sidebar + header frame around every dashboard page; also owns persistence for the signed-in user. */
export function DashboardShell({ userId, children }: { userId: string; children: ReactNode }) {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  useClientStateSync(userId);

  return (
    <div className="flex min-h-screen">
      <a
        href="#main-content"
        className="sr-only z-50 rounded-lg bg-accent px-4 py-2 text-accent-contrast focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        {t("app.skipToContent")}
      </a>
      <Sidebar mobileOpen={menuOpen} onClose={closeMenu} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header onOpenMenu={() => setMenuOpen(true)} menuOpen={menuOpen} />
        <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 focus:outline-none sm:px-6 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
