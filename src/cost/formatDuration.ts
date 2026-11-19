/** Format seconds as compact human duration: 50s, 1m 5s, 1h 2m. */
export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0s';
  const total = Math.round(seconds);
  if (total < 60) return `${total}s`;

  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;

  if (h > 0) {
    return s > 0 ? `${h}h ${m}m ${s}s` : m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

/** e.g. "$150.00 in 1m 0s" */
export function formatCostAtTime(totalUsd: number, deliverySeconds: number): string {
  return `$${totalUsd.toFixed(2)} in ${formatDuration(deliverySeconds)}`;
}

export function deliverySecondsFromMakespan(
  makespan: number,
  secondsPerStep: number,
): number {
  return makespan * secondsPerStep;
}
