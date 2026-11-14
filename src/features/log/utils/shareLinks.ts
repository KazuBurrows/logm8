import { formatServicedDate } from "../../serviceRecord/utils/recordDisplay";

/** A read-only link to the log, as GetShareLinks / CreateShareLink return it. */
export interface ShareLink {
  url: string;
  token: string;
  expiresAt: string; // ISO 8601 UTC
}

export const SHARE_LINK_DAYS = [1, 7, 30] as const;
export type ShareLinkDays = (typeof SHARE_LINK_DAYS)[number];
export const DEFAULT_SHARE_LINK_DAYS: ShareLinkDays = 7;

/** Most share links a vehicle can have active at once (the API enforces it too). */
export const MAX_SHARE_LINKS = 5;

const HOUR_MS = 60 * 60 * 1000;

/**
 * Guest links ending within the hour are the mobile app's 30-minute guest scans rather than
 * shared links; like the API, they don't count towards the limit.
 */
export function isGuestScan(link: ShareLink, now = Date.now()): boolean {
  return Date.parse(link.expiresAt) - now <= HOUR_MS;
}

export function activeShareLinkCount(links: ShareLink[], now = Date.now()): number {
  return links.filter((l) => !isGuestScan(l, now)).length;
}

/** "in 12 min", "at 14:32" (within a day) or "21 Nov 2026". */
export function formatLinkExpiry(expiresAt: string | null | undefined, now = Date.now()): string {
  const at = expiresAt ? Date.parse(expiresAt) : NaN;
  if (Number.isNaN(at)) return "";
  const left = at - now;
  if (left <= HOUR_MS) return `in ${Math.max(1, Math.round(left / 60000))} min`;
  if (left < 24 * HOUR_MS) {
    return `at ${new Date(at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
  }
  return formatServicedDate(expiresAt);
}
