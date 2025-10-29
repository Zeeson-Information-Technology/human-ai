export function computeRemainingMs(startedAt: number, now: number, durationMs: number) {
  return Math.max(0, durationMs - Math.max(0, now - startedAt));
}

