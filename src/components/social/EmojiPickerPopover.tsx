"use client";

import { EmojiPicker } from "frimousse";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/store/hooks";

const PANEL_WIDTH = 304;
const PANEL_HEIGHT = 340;
const GAP = 8;

interface EmojiPickerPopoverProps {
  /** Accessible name of the trigger button. */
  label: string;
  onSelect: (emoji: string) => void;
  triggerClassName: string;
  children: ReactNode;
}

/**
 * Searchable emoji picker (frimousse) in a popover. The panel is portaled to <body> with fixed
 * positioning because feed cards are transformed (drag-and-drop), which would otherwise trap it
 * under the next card. It opens below the trigger, or above when there is no room.
 * Emoji data comes from our own /api/emojibase route, not a public CDN.
 */
export function EmojiPickerPopover({ label, onSelect, triggerClassName, children }: EmojiPickerPopoverProps) {
  const { t } = useTranslation();
  const language = useAppSelector((state) => state.preferences.language);
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Position by writing styles directly: it runs on every scroll frame, and no render depends on it.
  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const trigger = triggerRef.current?.getBoundingClientRect();
      const panel = panelRef.current;
      if (!trigger || !panel) return;
      const below = trigger.bottom + GAP + PANEL_HEIGHT <= window.innerHeight;
      const top = below ? trigger.bottom + GAP : Math.max(GAP, trigger.top - GAP - PANEL_HEIGHT);
      const left = Math.min(Math.max(GAP, trigger.right - PANEL_WIDTH), window.innerWidth - PANEL_WIDTH - GAP);
      panel.style.top = `${top}px`;
      panel.style.left = `${Math.max(GAP, left)}px`;
    };
    place();
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!panelRef.current?.contains(target) && !triggerRef.current?.contains(target)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((value) => !value)}
        className={triggerClassName}
      >
        {children}
      </button>
      {open &&
        createPortal(
          <div
            ref={panelRef}
            role="dialog"
            data-emoji-picker=""
            aria-label={label}
            style={{ width: PANEL_WIDTH, height: PANEL_HEIGHT }}
            className="fixed z-50 overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_16px_40px_-12px_rgb(0_0_0/0.25)]"
          >
            <EmojiPicker.Root
              locale={language}
              emojibaseUrl="/api/emojibase"
              columns={8}
              onEmojiSelect={({ emoji }) => {
                onSelect(emoji);
                setOpen(false);
                triggerRef.current?.focus();
              }}
              className="flex h-full flex-col"
            >
              <EmojiPicker.Search
                autoFocus
                aria-label={t("social.pickerSearch")}
                placeholder={t("social.pickerSearch")}
                className="m-2 h-9 rounded-full border border-border bg-bg px-3.5 text-sm outline-none focus:border-text"
              />
              <EmojiPicker.Viewport className="relative flex-1 outline-none">
                <EmojiPicker.Loading className="absolute inset-0 flex items-center justify-center text-sm text-muted">
                  {t("social.pickerLoading")}
                </EmojiPicker.Loading>
                <EmojiPicker.Empty className="absolute inset-0 flex items-center justify-center text-sm text-muted">
                  {t("social.pickerEmpty")}
                </EmojiPicker.Empty>
                <EmojiPicker.List
                  className="select-none pb-2"
                  components={{
                    CategoryHeader: ({ category, ...props }) => (
                      <div className="bg-surface px-3 pb-1 pt-2.5 text-[11px] font-medium uppercase tracking-[0.12em] text-muted" {...props}>
                        {category.label}
                      </div>
                    ),
                    Row: ({ children, ...props }) => (
                      <div className="scroll-my-1.5 px-2" {...props}>
                        {children}
                      </div>
                    ),
                    Emoji: ({ emoji, ...props }) => (
                      <button className="flex size-9 items-center justify-center rounded-lg text-xl data-[active]:bg-surface-2" {...props}>
                        {emoji.emoji}
                      </button>
                    ),
                  }}
                />
              </EmojiPicker.Viewport>
            </EmojiPicker.Root>
          </div>,
          document.body,
        )}
    </>
  );
}
