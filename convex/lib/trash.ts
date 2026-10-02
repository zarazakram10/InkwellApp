export const TRASH_RETENTION_DAYS = 30;

const DAY_MS = 24 * 60 * 60 * 1000;

export const TRASH_RETENTION_MS = TRASH_RETENTION_DAYS * DAY_MS;

export function daysUntilPermanentDeletion(
  trashedAt: number,
  now = Date.now(),
): number {
  const remaining = trashedAt + TRASH_RETENTION_MS - now;
  if (remaining <= 0) {
    return 0;
  }
  return Math.ceil(remaining / DAY_MS);
}
