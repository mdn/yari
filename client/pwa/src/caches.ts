declare var __COMMIT_HASH__: string;

export const cacheName = `mdn-app-${__COMMIT_HASH__}`;
export const contentCache = "mdn-content-v1";

export function openCache(): Promise<Cache> {
  return caches.open(cacheName);
}

export function openContentCache(): Promise<Cache> {
  return caches.open(contentCache);
}
