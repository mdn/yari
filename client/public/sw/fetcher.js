importScripts("./sw/handlers.js");

async function respond(e) {
  const url = new URL(e.request.url);
  console.log(`going for: ${url.href}`);
  if ([self.location.host].includes(url.host)) {
    if (url.pathname.startsWith("/api/v1")) {
      if (url.pathname == "/api/v1/whoami") {
        return handleWhoAmI(url);
      } else if (url.pathname.startsWith("/api/v1/plus/collection")) {
        return handleCollections(e.request);
      } else if (url.pathname.startsWith("/api/v1/plus/watched")) {
        return handleWatched(e.request);
      } else if (url.pathname.startsWith("/api/v1/plus/watch/")) {
        return handleWatch(e.request);
      }
      try {
        return await fetch(e.request);
      } catch {
        return new Response(jsonBlob({ error: "offline" }));
      }
    }
    /*
      if (url.pathname == "/api/v1/settings") {
        const whoami = jsonBlob({ nothing: null });
        return new Response(whoami);
      }
      */
    if (!url.pathname.split("/").pop().includes(".")) {
      return await caches.match("/index.html");
    }
    const r = await caches.match(e.request);
    if (r) {
      return r;
    }
    console.log(`hit test: ${url.href}`);
    if (url.pathname.startsWith("/en-US/docs/")) {
      url.pathname = url.pathname.toLowerCase();
      try {
        const response = await caches.match(url.href);
        if (response) {
          console.log(`from cache: ${url.href}`);
          return response;
        }
      } catch (e) {
        console.log(url.href);
        console.log(e);
      }
    }
  }
  const response = await fetch(e.request);
  return response;
}
