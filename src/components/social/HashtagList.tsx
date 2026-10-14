"use client";

import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { setSearchQuery } from "@/features/search/searchSlice";
import { useAppDispatch } from "@/store/hooks";

/** Clickable hashtags: each one runs a search for the tag, like on X or Instagram. */
export function HashtagList({ tags }: { tags: string[] }) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const router = useRouter();
  if (tags.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-x-3 gap-y-1">
      {tags.map((tag) => (
        <li key={tag}>
          <button
            type="button"
            aria-label={t("social.searchTag", { tag })}
            onClick={() => {
              dispatch(setSearchQuery(tag.replace(/^#/, "")));
              router.push("/search");
            }}
            className="text-sm font-medium text-social hover:underline"
          >
            {tag}
          </button>
        </li>
      ))}
    </ul>
  );
}
