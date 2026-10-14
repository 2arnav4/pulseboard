"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { clsx } from "clsx";
import { toggleReaction } from "@/features/social/socialSlice";
import { formatCompactNumber } from "@/lib/format";
import { baseReactions, combineReactions, QUICK_REACTIONS } from "@/lib/social";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { ContentItem } from "@/types/content";
import { EmojiPickerPopover } from "./EmojiPickerPopover";

const NO_REACTIONS: string[] = [];

const chipClass = "inline-flex min-h-8 items-center gap-1.5 rounded-full px-2.5 text-sm transition-colors";

/**
 * Reaction counts plus a quick-react tray (the six common reactions) and a full emoji picker,
 * like LinkedIn/Slack. Chips are toggle buttons: aria-pressed says whether you reacted.
 */
export function ReactionBar({ item }: { item: ContentItem }) {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const mine = useAppSelector((state) => state.social.reactions[item.id] ?? NO_REACTIONS);
  const [trayOpen, setTrayOpen] = useState(false);
  const counts = useMemo(() => combineReactions(baseReactions(item), mine), [item, mine]);
  const trayRef = useRef<HTMLDivElement>(null);

  // Close on outside click or Escape. Clicks inside the portaled emoji picker count as inside.
  useEffect(() => {
    if (!trayOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Element;
      if (!trayRef.current?.contains(target) && !target.closest("[data-emoji-picker]")) setTrayOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !document.querySelector("[data-emoji-picker]")) setTrayOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [trayOpen]);

  const react = (emoji: string) => dispatch(toggleReaction({ itemId: item.id, emoji }));

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <AnimatePresence initial={false}>
        {counts.map(({ emoji, count, mine: isMine }) => (
          <motion.button
            key={emoji}
            layout
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            whileTap={{ scale: 0.9 }}
            type="button"
            aria-pressed={isMine}
            aria-label={t("social.reactionChip", { emoji, count })}
            onClick={() => react(emoji)}
            className={clsx(chipClass, isMine ? "bg-accent-soft text-accent ring-1 ring-inset ring-accent/40" : "bg-surface-2 text-text hover:ring-1 hover:ring-inset hover:ring-border")}
          >
            <span aria-hidden="true">{emoji}</span>
            <span aria-hidden="true" className="num text-xs font-medium">
              {formatCompactNumber(count, i18n.language)}
            </span>
          </motion.button>
        ))}
      </AnimatePresence>

      <div ref={trayRef} className="relative flex items-center">
        <button
          type="button"
          aria-expanded={trayOpen}
          aria-label={t("social.addReaction", { title: item.title })}
          onClick={() => setTrayOpen((value) => !value)}
          className={clsx(chipClass, "text-muted ring-1 ring-inset ring-border hover:text-text hover:ring-text")}
        >
          <span aria-hidden="true" className="text-base leading-none grayscale">
            🙂
          </span>
          <span className="text-xs font-medium">{t("social.react")}</span>
        </button>
        <AnimatePresence>
          {trayOpen && (
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="ml-1.5 flex items-center gap-0.5 rounded-full border border-border bg-surface px-1 py-0.5"
            >
              {QUICK_REACTIONS.map((emoji) => (
                <motion.button
                  key={emoji}
                  type="button"
                  whileHover={{ scale: 1.3, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={t("social.reactWith", { emoji })}
                  aria-pressed={mine.includes(emoji)}
                  onClick={() => {
                    react(emoji);
                    setTrayOpen(false);
                  }}
                  className="grid size-8 place-items-center rounded-full text-lg"
                >
                  {emoji}
                </motion.button>
              ))}
              <EmojiPickerPopover
                label={t("social.moreEmoji")}
                onSelect={(emoji) => {
                  if (!mine.includes(emoji)) react(emoji);
                  setTrayOpen(false);
                }}
                triggerClassName="grid size-8 place-items-center rounded-full text-sm font-medium text-muted hover:bg-surface-2 hover:text-text"
              >
                <span aria-hidden="true">+</span>
              </EmojiPickerPopover>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
