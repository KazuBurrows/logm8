import { activeShareLinkCount, formatLinkExpiry, isGuestScan, ShareLink } from "./shareLinks";

const NOW = Date.parse("2026-11-14T12:00:00.000Z");
const link = (minutesLeft: number): ShareLink => ({
  url: "u",
  token: String(minutesLeft),
  expiresAt: new Date(NOW + minutesLeft * 60000).toISOString(),
});

test("links ending within the hour are guest scans and don't count towards the limit", () => {
  expect(isGuestScan(link(25), NOW)).toBe(true);
  expect(isGuestScan(link(60 * 24 * 7), NOW)).toBe(false);
  expect(activeShareLinkCount([link(25), link(60 * 24), link(60 * 24 * 7)], NOW)).toBe(2);
});

test("expiry reads as minutes, a time today, or a date", () => {
  expect(formatLinkExpiry(link(12).expiresAt, NOW)).toBe("in 12 min");
  expect(formatLinkExpiry(link(180).expiresAt, NOW)).toMatch(/^at \d\d:\d\d$/);
  // Shown in the viewer's local time zone.
  expect(formatLinkExpiry(new Date(2026, 10, 21, 12, 0).toISOString(), NOW)).toBe("21 Nov 2026");
  expect(formatLinkExpiry(null, NOW)).toBe("");
});
