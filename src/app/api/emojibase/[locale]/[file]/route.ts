import enData from "emojibase-data/en/data.json";
import enMessages from "emojibase-data/en/messages.json";
import esData from "emojibase-data/es/data.json";
import esMessages from "emojibase-data/es/messages.json";
import hiData from "emojibase-data/hi/data.json";
import hiMessages from "emojibase-data/hi/messages.json";
import emojibasePackage from "emojibase-data/package.json";

/**
 * GET /api/emojibase/{en|es|hi}/{data|messages}.json
 *
 * Self-hosts the Emojibase dataset the emoji picker (frimousse) needs, instead of letting the
 * browser fetch it from a public CDN. Same-origin, versioned with the installed package, and
 * cacheable for a week. The picker also sends HEAD requests for the ETag, which Next answers from GET.
 */
const DATASETS: Record<string, Record<string, unknown>> = {
  en: { "data.json": enData, "messages.json": enMessages },
  es: { "data.json": esData, "messages.json": esMessages },
  hi: { "data.json": hiData, "messages.json": hiMessages },
};

export async function GET(_request: Request, { params }: RouteContext<"/api/emojibase/[locale]/[file]">) {
  const { locale, file } = await params;
  const body = DATASETS[locale]?.[file];
  if (!body) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(body, {
    headers: {
      "Cache-Control": "private, max-age=604800, immutable",
      ETag: `"emojibase-${emojibasePackage.version}-${locale}-${file}"`,
    },
  });
}
