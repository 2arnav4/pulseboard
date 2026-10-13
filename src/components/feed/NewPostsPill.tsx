"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { revealLiveItems } from "@/features/feed/feedSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

/** Real-time posts wait behind this pill so content never jumps while the user is reading. */
export function NewPostsPill() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const count = useAppSelector((state) => state.feed.pendingLive.length);

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          className="sticky top-20 z-10 flex justify-center"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
        >
          <button
            type="button"
            data-testid="new-posts-pill"
            onClick={() => {
              dispatch(revealLiveItems());
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="num inline-flex min-h-10 items-center gap-2 rounded-full bg-ink px-5 text-sm font-medium text-ink-contrast shadow-[0_10px_30px_-10px_rgb(0_0_0/0.35)] transition-colors hover:bg-accent hover:text-accent-contrast"
          >
            {t("feed.newPosts", { count })}
            <span aria-hidden="true">↑</span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
