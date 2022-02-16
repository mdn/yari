importScripts("./sw/fetcher.js");
importScripts("./sw/manager.js");

self.addEventListener("fetch", (e) => {
  e.respondWith(
    (async () => {
      try {
        return await fetch(e.request);
      } catch {
        return respond(e);
      }
    })()
  );
});
