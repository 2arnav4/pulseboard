"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { ContentItem } from "@/types/content";
import { ContentCard } from "./ContentCard";

interface ContentGridProps {
  items: ContentItem[];
  label: string;
}

/** Responsive card grid with staggered enter and animated exit (e.g. un-favoriting). */
export function ContentGrid({ items, label }: ContentGridProps) {
  return (
    <ul aria-label={label} className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      <AnimatePresence initial={true}>
        {items.map((item, index) => (
          <motion.li
            key={item.id}
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0, transition: { delay: Math.min(index, 8) * 0.04 } }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <ContentCard item={item} />
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
