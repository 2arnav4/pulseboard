"use client";

import { useTranslation } from "react-i18next";
import { SearchBar } from "@/components/search/SearchBar";
import { MenuGlyph } from "@/components/ui/icons";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";

export function Header({ onOpenMenu, menuOpen }: { onOpenMenu: () => void; menuOpen: boolean }) {
  const { t } = useTranslation();
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-2 border-b border-border bg-bg/90 px-4 backdrop-blur sm:gap-3 sm:px-8">
      <button
        type="button"
        onClick={onOpenMenu}
        aria-label={t("nav.openMenu")}
        aria-expanded={menuOpen}
        aria-controls="mobile-nav"
        className="-ml-2 grid size-10 shrink-0 place-items-center rounded-full hover:bg-surface-2 lg:hidden"
      >
        <MenuGlyph className="size-5" />
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
