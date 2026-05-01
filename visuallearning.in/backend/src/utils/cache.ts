/**
 * Simple in-memory cache with TTL for frequently accessed, rarely changing data.
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<any>>();

/** Get cached value or null if expired/missing */
export function cacheGet<T>(key: string): T | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.data;
}

/** Set cached value with TTL in seconds */
export function cacheSet<T>(key: string, data: T, ttlSeconds: number): void {
  store.set(key, { data, expiresAt: Date.now() + ttlSeconds * 1000 });
}

/** Invalidate a specific key or all keys matching a prefix */
export function cacheInvalidate(keyOrPrefix: string): void {
  if (store.has(keyOrPrefix)) {
    store.delete(keyOrPrefix);
  } else {
    for (const key of store.keys()) {
      if (key.startsWith(keyOrPrefix)) store.delete(key);
    }
  }
}
