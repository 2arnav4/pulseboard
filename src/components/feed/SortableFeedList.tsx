"use client";

import { Reorder, useDragControls } from "framer-motion";
import { ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ContentCard } from "@/components/content/ContentCard";
import { setFeedOrder } from "@/features/feed/feedSlice";
import { useAppDispatch } from "@/store/hooks";
import type { ContentItem } from "@/types/content";

interface ItemProps {
  item: ContentItem;
  index: number;
  total: number;
  onMove: (index: number, delta: -1 | 1) => void;
}

function SortableFeedItem({ item, index, total, onMove }: ItemProps) {
  const { t } = useTranslation();
  // Dragging starts only from the handle, so text selection and links inside the card keep working.
  const controls = useDragControls();

  const controlClass =
    "inline-flex size-9 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-text disabled:opacity-30 disabled:hover:bg-transparent";

  return (
    <Reorder.Item
      as="li"
      value={item}
      dragListener={false}
      dragControls={controls}
      data-testid="feed-item"
      className="relative list-none"
      whileDrag={{ scale: 1.02, zIndex: 10, boxShadow: "0 20px 40px rgba(0,0,0,0.18)" }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <ContentCard
        item={item}
        layout="row"
        reorderControls={
          <>
            <button
              type="button"
              className={controlClass}
              onClick={() => onMove(index, -1)}
              disabled={index === 0}
              aria-label={t("card.moveUp", { title: item.title })}
            >
              <ChevronUp aria-hidden="true" className="size-5" />
            </button>
            <button
              type="button"
              className={controlClass}
              onClick={() => onMove(index, 1)}
              disabled={index === total - 1}
              aria-label={t("card.moveDown", { title: item.title })}
            >
              <ChevronDown aria-hidden="true" className="size-5" />
            </button>
            <span
              role="img"
              data-testid="drag-handle"
              aria-label={t("card.dragHandle", { title: item.title })}
              onPointerDown={(event) => controls.start(event)}
              className="inline-flex size-9 cursor-grab touch-none items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-text active:cursor-grabbing"
            >
              <GripVertical aria-hidden="true" className="size-5" />
            </span>
          </>
        }
      />
    </Reorder.Item>
  );
}

/**
 * Drag-and-drop feed built on Framer Motion's Reorder. Pointer users drag the handle;
 * keyboard and screen-reader users use the move buttons, and every move is announced.
 */
export function SortableFeedList({ items, label }: { items: ContentItem[]; label: string }) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [announcement, setAnnouncement] = useState("");

  const move = (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    const ids = items.map((item) => item.id);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    dispatch(setFeedOrder(ids));
    setAnnouncement(t("feed.reordered", { title: items[index].title, position: target + 1 }));
  };

  return (
    <>
      <Reorder.Group
        as="ul"
        axis="y"
        values={items}
        onReorder={(next: ContentItem[]) => dispatch(setFeedOrder(next.map((item) => item.id)))}
        aria-label={label}
        className="flex flex-col gap-4"
      >
        {items.map((item, index) => (
          <SortableFeedItem key={item.id} item={item} index={index} total={items.length} onMove={move} />
        ))}
      </Reorder.Group>
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </>
  );
}
