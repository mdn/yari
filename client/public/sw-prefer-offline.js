importScripts("./sw/fetcher.js");
importScripts("./sw/manager.js");

self.addEventListener("fetch", (e) => {
  e.respondWith(respond(e));
});
