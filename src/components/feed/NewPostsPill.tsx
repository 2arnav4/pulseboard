"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
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
            className="inline-flex min-h-10 items-center gap-2 rounded-full bg-accent px-4 text-sm font-medium text-accent-contrast shadow-lg hover:bg-accent-hover"
          >
            <ArrowUp aria-hidden="true" className="size-4" />
            {t("feed.newPosts", { count })}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
