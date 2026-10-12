"use client";

import { Film, MessageCircle, Newspaper } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { clsx } from "clsx";
import type { ContentSource } from "@/types/content";

const PLACEHOLDER: Record<ContentSource, { icon: typeof Film; gradient: string }> = {
  news: { icon: Newspaper, gradient: "from-sky-500/25 to-indigo-500/25" },
  movie: { icon: Film, gradient: "from-amber-500/25 to-rose-500/25" },
  social: { icon: MessageCircle, gradient: "from-fuchsia-500/25 to-violet-500/25" },
};

interface ContentImageProps {
  src: string | null;
  source: ContentSource;
  className?: string;
  sizes: string;
}

/**
 * Card artwork. TMDB posters go through Next's optimizer (allow-listed host); news images come
 * from arbitrary publishers, so they are served unoptimized rather than opening the optimizer to every host.
 * Broken or missing images fall back to a gradient with the source icon.
 */
export function ContentImage({ src, source, className, sizes }: ContentImageProps) {
  const [failed, setFailed] = useState(false);
  const { icon: Icon, gradient } = PLACEHOLDER[source];

  return (
    <div className={clsx("relative overflow-hidden bg-surface-2", className)}>
      {src && !failed ? (
        <Image
          src={src}
          alt=""
          fill
          sizes={sizes}
          unoptimized={!src.startsWith("https://image.tmdb.org/")}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className={clsx("flex size-full items-center justify-center bg-gradient-to-br", gradient)}>
          <Icon aria-hidden="true" className="size-8 text-muted" />
        </div>
      )}
    </div>
  );
}
