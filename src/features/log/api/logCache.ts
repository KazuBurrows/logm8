// Per-tag copy of a log's service records, kept in localStorage so it survives the full
// page load every NFC scan triggers. Later visits only fetch records changed since lastUpdated.
//
// v2: v1 entries held each record's creation token (a working service token) and raw user
// IDs, so they're deleted rather than migrated; the next visit refetches in full.
const INDEX_KEY = "logm8:log:v2"; // tag ids, most recently viewed first
const ENTRY_PREFIX = INDEX_KEY + ":";
const MAX_CACHED_LOGS = 20;
const OLD_KEY_PREFIX = "logm8:log:v1";

let oldVersionsPurged = false;

/** Deletes caches written by older versions of this module (once per page load). */
export function purgeOldLogCaches(): void {
  if (oldVersionsPurged) return;
  oldVersionsPurged = true;
  try {
    const stale: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(OLD_KEY_PREFIX)) stale.push(key);
    }
    stale.forEach((key) => localStorage.removeItem(key));
  } catch {
    // localStorage unavailable; nothing to purge
  }
}

/**
 * How a GetLogData response identifies owners: "owner" = opaque OwnerKey/viewerKey (current
 * API), "user" = raw UserId/userId (older API). Records cached under one can't be matched
 * against a viewer from the other, so a change of kind means a full refetch.
 */
export type OwnerKeyKind = "owner" | "user";

export function ownerKeyKind(data: any): OwnerKeyKind {
  return data?.viewerKey !== undefined ? "owner" : "user";
}

export interface LogCache {
  lastUpdated: string; // UTC ISO of the newest LastModified at the last server sync; "" = fetch everything
  id: string; // Tag.Id
  logHistory: ServiceRecord[];
  keyKind?: OwnerKeyKind; // absent = "user" (written before owner keys)
}

// The server stamps LastModified in .NET "o" format (7 fractional digits). JS Date only
// defines 3, so trim before parsing; trimming also rounds down, which keeps lastUpdated at
// or before the newest record rather than after it (the server filters with >=).
function toUtcMs(value: string | null | undefined): number | null {
  if (!value) return null;
  const ms = Date.parse(value.replace(/(\.\d{3})\d+/, "$1"));
  return Number.isNaN(ms) ? null : ms;
}

export function latestLastModified(records: ServiceRecord[]): string {
  let latest: number | null = null;
  for (const record of records) {
    const ms = toUtcMs(record.LastModified);
    if (ms !== null && (latest === null || ms > latest)) latest = ms;
  }
  return latest === null ? "" : new Date(latest).toISOString();
}

// Upserts by id (the >= filter re-sends the newest record every time) and restores the
// server's ORDER BY ServicedDate DESC.
export function mergeRecords(cached: ServiceRecord[], incoming: ServiceRecord[]): ServiceRecord[] {
  const byId = new Map(cached.map((r): [string, ServiceRecord] => [r.id, r]));
  incoming.forEach((r) => byId.set(r.id, r));
  return Array.from(byId.values()).sort((a, b) => {
    const aDate = a.ServicedDate ?? "";
    const bDate = b.ServicedDate ?? "";
    return aDate < bDate ? 1 : aDate > bDate ? -1 : 0;
  });
}

// canEdit depends on who is viewing, so a cached value may belong to a previous viewer.
// Mirrors the server: only a service-mode caller can edit, and only their own records.
// "viewer" is the response's viewerKey (kind "owner") or userId (kind "user").
export function applyCanEdit(
  records: ServiceRecord[],
  isServiceMode: boolean,
  viewer: string | null,
  kind: OwnerKeyKind = "user"
): ServiceRecord[] {
  return records.map((r) => {
    const owner = kind === "owner" ? r.OwnerKey : r.UserId;
    return { ...r, canEdit: isServiceMode && !!owner && owner === viewer };
  });
}

function isLogCache(value: any): value is LogCache {
  return (
    !!value &&
    typeof value.id === "string" &&
    typeof value.lastUpdated === "string" &&
    (value.lastUpdated === "" || toUtcMs(value.lastUpdated) !== null) &&
    Array.isArray(value.logHistory)
  );
}

function readIndex(): string[] {
  purgeOldLogCaches();
  try {
    const index = JSON.parse(localStorage.getItem(INDEX_KEY) ?? "[]");
    return Array.isArray(index) ? index.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function readLogCache(tagId: string): LogCache | null {
  try {
    const raw = localStorage.getItem(ENTRY_PREFIX + tagId);
    if (!raw) return null;

    const entry = JSON.parse(raw);
    return isLogCache(entry) && entry.id === tagId ? entry : null;
  } catch {
    return null;
  }
}

// A new token doesn't say which tag it belongs to, so the last viewed tag is the best guess.
export function readLastViewedLog(): LogCache | null {
  const [lastTagId] = readIndex();
  return lastTagId ? readLogCache(lastTagId) : null;
}

export function writeLogCache(entry: LogCache): void {
  try {
    localStorage.setItem(ENTRY_PREFIX + entry.id, JSON.stringify(entry));

    const index = [entry.id, ...readIndex().filter((id) => id !== entry.id)];
    index.slice(MAX_CACHED_LOGS).forEach((id) => localStorage.removeItem(ENTRY_PREFIX + id));
    localStorage.setItem(INDEX_KEY, JSON.stringify(index.slice(0, MAX_CACHED_LOGS)));
  } catch {
    // localStorage unavailable/full — fail silently, the next visit just does a full fetch
  }
}
