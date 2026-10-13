"use client";

import Image from "next/image";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { clsx } from "clsx";
import type { ContentSource } from "@/types/content";

interface ContentImageProps {
  src: string | null;
  source: ContentSource;
  className?: string;
  sizes: string;
}

/**
 * Card artwork. TMDB posters go through Next's optimizer (allow-listed host); news images come
 * from arbitrary publishers, so they are served unoptimized rather than opening the optimizer to every host.
 * Broken or missing images fall back to a plain paper panel with the source name set in serif.
 */
export function ContentImage({ src, source, className, sizes }: ContentImageProps) {
  const { t } = useTranslation();
  const [failed, setFailed] = useState(false);

  return (
    <div className={clsx("relative overflow-hidden rounded-2xl bg-surface-2", className)}>
      {src && !failed ? (
        <Image
          src={src}
          alt=""
          fill
          sizes={sizes}
          unoptimized={!src.startsWith("https://image.tmdb.org/")}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          onError={() => setFailed(true)}
        />
      ) : (
        <div aria-hidden="true" className="flex size-full items-center justify-center">
          <span className="font-display text-xl font-semibold text-muted">{t(`card.source.${source}`)}</span>
        </div>
      )}
    </div>
  );
}
