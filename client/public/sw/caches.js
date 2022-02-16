const cacheName = "mdn-app-1";
const contentCache = "mdn-content-1";

var contentCachePromise;
var cachePromise;
function openCache() {
  if (!cachePromise) {
    cachePromise = caches.open(cacheName);
  }
  return cachePromise;
}

function openContentCache() {
  if (!contentCachePromise) {
    contentCachePromise = caches.open(contentCache);
  }
  return contentCachePromise;
}
