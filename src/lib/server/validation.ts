import "server-only";
import { z } from "zod";
import { CATEGORIES, CONTENT_SOURCES, isCategory, type Category } from "@/types/content";

const DEFAULT_CATEGORIES: Category[] = ["technology", "business", "sports"];

const page = z.coerce.number().int().min(1).max(50).default(1);

const categoryList = z
  .string()
  .optional()
  .transform((raw): Category[] => {
    const parsed = (raw ?? "").split(",").map((value) => value.trim()).filter(isCategory);
    return parsed.length > 0 ? [...new Set(parsed)] : DEFAULT_CATEGORIES;
  });

export const feedQuerySchema = z.object({
  categories: categoryList,
  page,
  seed: z.coerce.number().int().positive().optional(),
});

export const searchQuerySchema = z.object({
  q: z.string().trim().min(2, "Query must be at least 2 characters").max(100),
  type: z.enum(["all", ...CONTENT_SOURCES]).default("all"),
  page,
});

export const trendingQuerySchema = z.object({
  source: z.enum(CONTENT_SOURCES).default("news"),
});

export const socialQuerySchema = z.object({
  category: z.enum(CATEGORIES).optional(),
  q: z.string().trim().max(100).default(""),
  page,
});

/** Parse URL search params against a schema; returns data or a 400 Response. */
export function parseQuery<S extends z.ZodType>(
  schema: S,
  url: string,
): { ok: true; data: z.output<S> } | { ok: false; response: Response } {
  const params = Object.fromEntries(new URL(url).searchParams);
  const result = schema.safeParse(params);
  if (result.success) return { ok: true, data: result.data };
  return {
    ok: false,
    response: Response.json(
      { error: "Invalid query", issues: result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`) },
      { status: 400 },
    ),
  };
}
