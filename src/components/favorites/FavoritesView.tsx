"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { ContentGrid } from "@/components/content/ContentGrid";
import { BUTTON_BASE, BUTTON_VARIANTS, Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Spinner } from "@/components/ui/Spinner";
import { clearFavorites } from "@/features/favorites/favoritesSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export function FavoritesView() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const hydrated = useAppSelector((state) => state.app.hydrated);
  const favorites = useAppSelector((state) => state.favorites.items);

  return (
    <section>
      <PageHeader
        title={t("favorites.title")}
        subtitle={hydrated ? `${t("favorites.subtitle")} ${t("favorites.count", { count: favorites.length })}` : t("favorites.subtitle")}
        actions={
          favorites.length > 0 && (
            <Button variant="danger" onClick={() => dispatch(clearFavorites())}>
              {t("favorites.clear")}
            </Button>
          )
        }
      />
      {!hydrated ? (
        <Spinner label={t("state.loading")} />
      ) : favorites.length === 0 ? (
        <EmptyState
          title={t("favorites.emptyTitle")}
          body={t("favorites.emptyBody")}
          action={
            <Link href="/" className={`${BUTTON_BASE} ${BUTTON_VARIANTS.primary}`}>
              {t("favorites.browse")}
            </Link>
          }
        />
      ) : (
        <ContentGrid items={favorites} label={t("favorites.title")} />
      )}
    </section>
  );
}
