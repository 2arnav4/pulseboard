"use client";

import { Menu } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SearchBar } from "@/components/search/SearchBar";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";

export function Header({ onOpenMenu, menuOpen }: { onOpenMenu: () => void; menuOpen: boolean }) {
  const { t } = useTranslation();
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-2 border-b border-border bg-bg/85 px-4 backdrop-blur sm:gap-3 sm:px-6">
      <button
        type="button"
        onClick={onOpenMenu}
        aria-label={t("nav.openMenu")}
        aria-expanded={menuOpen}
        aria-controls="mobile-nav"
        className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl hover:bg-surface-2 lg:hidden"
      >
        <Menu aria-hidden="true" className="size-5" />
      </button>
      <SearchBar />
      <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
        <div className="hidden sm:block">
          <LanguageSwitcher />
        </div>
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
