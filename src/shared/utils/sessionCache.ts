const KEY_PREFIX = "logm8:cache:";

export const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export function getCached<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(KEY_PREFIX + key);
    if (!raw) return null;

    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() > entry.expiresAt) {
      sessionStorage.removeItem(KEY_PREFIX + key);
      return null;
    }
    return entry.value;
  } catch {
    return null;
  }
}

export function setCached<T>(key: string, value: T, ttlMs: number): void {
  try {
    const entry: CacheEntry<T> = { value, expiresAt: Date.now() + ttlMs };
    sessionStorage.setItem(KEY_PREFIX + key, JSON.stringify(entry));
  } catch {
    // sessionStorage unavailable/full — fail silently, caller just refetches next time
  }
}

export function clearCached(key: string): void {
  try {
    sessionStorage.removeItem(KEY_PREFIX + key);
  } catch {
    // ignore
  }
}

export function clearAllCached(): void {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith(KEY_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => sessionStorage.removeItem(key));
  } catch {
    // sessionStorage unavailable — nothing to clear, caller proceeds with a cold cache anyway
  }
}
