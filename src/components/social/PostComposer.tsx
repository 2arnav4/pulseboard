"use client";

import { useSession } from "next-auth/react";
import { useRef, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { clsx } from "clsx";
import { Avatar } from "@/components/layout/Avatar";
import { Button } from "@/components/ui/Button";
import { postCreated } from "@/features/social/socialSlice";
import { POST_MAX_LENGTH } from "@/lib/social";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { CATEGORIES, isCategory, type Category } from "@/types/content";
import { EmojiPickerPopover } from "./EmojiPickerPopover";

/** Counter turns to a warning in the last 20 characters, like X. */
const WARN_AT = 20;

/**
 * "What's happening?" box. Posts are stored for this user in the browser (like favorites)
 * and appear at the top of the feed. Ctrl/Cmd + Enter posts.
 */
export function PostComposer() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { data: session } = useSession();
  const preferred = useAppSelector((state) => state.preferences.categories);
  const [text, setText] = useState("");
  const [category, setCategory] = useState<Category | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const name = session?.user?.name ?? session?.user?.email ?? "";
  const topic = category ?? preferred[0] ?? "general";
  const remaining = POST_MAX_LENGTH - text.length;
  const canPost = text.trim().length > 0 && remaining >= 0;

  const insertEmoji = (emoji: string) => {
    const field = textareaRef.current;
    const start = field?.selectionStart ?? text.length;
    const end = field?.selectionEnd ?? text.length;
    const next = (text.slice(0, start) + emoji + text.slice(end)).slice(0, POST_MAX_LENGTH);
    setText(next);
    // Put the caret after the inserted emoji once React has updated the value.
    requestAnimationFrame(() => {
      field?.focus();
      field?.setSelectionRange(start + emoji.length, start + emoji.length);
    });
  };

  const submit = (event?: FormEvent) => {
    event?.preventDefault();
    if (!canPost) return;
    dispatch(postCreated({ text, category: topic, author: name }));
    setText("");
    setAnnouncement(t("social.posted"));
  };

  return (
    <form onSubmit={submit} className="flex gap-3 rounded-3xl border border-border bg-surface p-4 sm:gap-4 sm:p-5">
      {session?.user && <Avatar name={name} color={session.user.avatarColor} size="md" />}
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <label htmlFor="post-composer" className="sr-only">
          {t("social.composerLabel")}
        </label>
        <textarea
          ref={textareaRef}
          id="post-composer"
          rows={2}
          value={text}
          maxLength={POST_MAX_LENGTH}
          aria-describedby="post-composer-count"
          placeholder={t("social.composerPlaceholder")}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) submit();
          }}
          className="field-sizing-content min-h-12 w-full resize-none bg-transparent pt-2 text-[0.95rem] leading-relaxed placeholder:text-muted focus:outline-none"
        />
        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
          <EmojiPickerPopover
            label={t("social.addEmoji")}
            onSelect={insertEmoji}
            triggerClassName="grid size-9 place-items-center rounded-full text-lg transition-colors hover:bg-surface-2"
          >
            <span aria-hidden="true">😊</span>
          </EmojiPickerPopover>
          <label htmlFor="post-topic" className="sr-only">
            {t("social.topic")}
          </label>
          <select
            id="post-topic"
            value={topic}
            onChange={(event) => {
              if (isCategory(event.target.value)) setCategory(event.target.value);
            }}
            className="min-h-9 rounded-full bg-transparent px-3 text-sm text-muted ring-1 ring-inset ring-border hover:text-text"
          >
            {CATEGORIES.map((value) => (
              <option key={value} value={value}>
                {t(`categories.${value}`)}
              </option>
            ))}
          </select>
          <span
            id="post-composer-count"
            className={clsx("num ml-auto text-xs", remaining <= WARN_AT ? "font-medium text-accent" : "text-muted")}
          >
            {t("social.charactersLeft", { count: remaining })}
          </span>
          <Button type="submit" disabled={!canPost} className="min-h-9">
            {t("social.post")}
          </Button>
        </div>
        <p role="status" className="sr-only">
          {announcement}
        </p>
      </div>
    </form>
  );
}
