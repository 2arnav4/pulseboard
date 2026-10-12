import { nextLivePost, sseFrame } from "@/lib/server/realtime";
import { feedQuerySchema, parseQuery } from "@/lib/server/validation";

const FIRST_EVENT_MS = 3_000;
const INTERVAL_MS = 12_000;
/** Close before the serverless time limit; EventSource reconnects on its own after `retry`. */
const STREAM_LIFETIME_MS = 55_000;
const RECONNECT_MS = 5_000;

export const maxDuration = 60;

/**
 * GET /api/realtime?categories=technology,sports — Server-Sent Events stream that
 * pushes a new social post periodically ("post" events) plus heartbeats.
 */
export async function GET(request: Request) {
  const parsed = parseQuery(feedQuerySchema, request.url);
  if (!parsed.ok) return parsed.response;
  const { categories } = parsed.data;
  const encoder = new TextEncoder();
  const timers: ReturnType<typeof setTimeout>[] = [];

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      let closed = false;
      const send = (chunk: string) => {
        if (!closed) controller.enqueue(encoder.encode(chunk));
      };
      const close = () => {
        if (closed) return;
        closed = true;
        timers.forEach(clearTimeout);
        controller.close();
      };

      send(`retry: ${RECONNECT_MS}\n\n`);
      send(sseFrame("ready", { categories }));

      const push = () => {
        send(sseFrame("post", nextLivePost(categories)));
        timers.push(setTimeout(push, INTERVAL_MS));
      };
      timers.push(setTimeout(push, FIRST_EVENT_MS));
      timers.push(setTimeout(close, STREAM_LIFETIME_MS));
      request.signal.addEventListener("abort", close);
    },
    cancel() {
      timers.forEach(clearTimeout);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
