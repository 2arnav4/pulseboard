/** Deterministic PRNG (mulberry32) so demo data is identical on every run and in tests. */
export function createRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pick<T>(items: readonly T[], random: () => number): T {
  return items[Math.floor(random() * items.length)];
}

/** Fixed reference date so generated timestamps do not drift between runs. */
export const MOCK_EPOCH = Date.UTC(2026, 9, 12, 12, 0, 0);

export function hoursAgo(hours: number): string {
  return new Date(MOCK_EPOCH - hours * 3_600_000).toISOString();
}
