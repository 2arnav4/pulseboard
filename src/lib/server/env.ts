import "server-only";

/** Server-side configuration. Keys never reach the browser bundle. */
export const serverEnv = {
  get newsApiKey(): string | undefined {
    return process.env.NEWS_API_KEY || undefined;
  },
  get tmdbApiKey(): string | undefined {
    return process.env.TMDB_API_KEY || undefined;
  },
  get databaseUrl(): string | undefined {
    return process.env.DATABASE_URL || undefined;
  },
  get forceMocks(): boolean {
    return process.env.MOCK_APIS === "1";
  },
};

/** Fetch JSON with a timeout and server-side caching; throws UpstreamError on non-2xx. */
export async function fetchJson<T>(
  url: string,
  init: { headers?: Record<string, string>; revalidateSeconds: number },
): Promise<T> {
  const response = await fetch(url, {
    headers: init.headers,
    signal: AbortSignal.timeout(8000),
    next: { revalidate: init.revalidateSeconds },
  });
  if (!response.ok) {
    throw new UpstreamError(response.status, await response.text().catch(() => ""));
  }
  return (await response.json()) as T;
}

export class UpstreamError extends Error {
  constructor(
    readonly status: number,
    body: string,
  ) {
    super(`Upstream responded ${status}: ${body.slice(0, 200)}`);
    this.name = "UpstreamError";
  }
}
