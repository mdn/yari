const prefetches = new Set<string>();

export function preload(url: string) {
  if (prefetches.has(url)) {
    return;
  }

  const prefetcher = document.createElement("link");
  prefetcher.rel = "prefetch";
  prefetcher.href = url;
  document.head.appendChild(prefetcher);

  prefetches.add(url);
}

let _isSupported: boolean | null = null;
export function preloadSupported() {
  if (_isSupported !== null) return _isSupported;

  const prefetchElement = document.createElement("link");
  _isSupported = Boolean(
    prefetchElement.relList &&
      prefetchElement.relList.supports &&
      prefetchElement.relList.supports("prefetch") &&
      window.IntersectionObserver &&
      "isIntersecting" in IntersectionObserverEntry.prototype
  );
  return _isSupported;
}
