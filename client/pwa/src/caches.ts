/* globals __COMMIT_HASH__ */
declare var __COMMIT_HASH__: string;
export const cacheName = `mdn-app-${__COMMIT_HASH__}`;
export const contentCache = "mdn-content-v1";

var contentCachePromise;
var cachePromise;
export function openCache(): Promise<Cache> {
  if (!cachePromise) {
    cachePromise = caches.open(cacheName);
  }
  return cachePromise;
}

export function openContentCache(): Promise<Cache> {
  if (!contentCachePromise) {
    contentCachePromise = caches.open(contentCache);
  }
  return contentCachePromise;
}
