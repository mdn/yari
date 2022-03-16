export const cacheName = "mdn-app-1";
export const contentCache = "mdn-content-1";

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
