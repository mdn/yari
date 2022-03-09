/// <reference lib="WebWorker" />

import { cacheName, contentCache, openCache } from "./caches";
import { respond } from "./fetcher";
import { unpackAndCache } from "./unpack-cache";
export const INTERACTIVE_EXAMPLES_URL =
  "https://interactive-examples.stage.mdn.mozilla.net";
const UPDATES_BASE_URL = "https://updates.developer.allizom.org";

// export empty type because of tsc --isolatedModules flag
export type {};
declare const self: ServiceWorkerGlobalScope;

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(
    (async () => {
      const cache = await openCache();
      const { files = {} } =
        (await (await fetch("/asset-manifest.json")).json()) || {};
      const assets = [...Object.values(files)];
      await cache.addAll(assets);
    })()
  );
});

self.addEventListener("message", (e) => {
  e.waitUntil(
    (async () => {
      switch (e?.data?.type) {
        // case "update":
        //     return updateContent(e?.data, e);
        default:
          console.log(`unknown msg type: ${e?.data?.type}`);
          return Promise.resolve();
      }
    })()
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(async () => {
    await self.clients.claim();
    return caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key === cacheName) {
            return;
          }
          return caches.delete(key);
        })
      );
    });
  });
});

self.addEventListener("fetch", (e) => {
  e.respondWith(respond(e));
});

export async function messageAllClients(
  self: ServiceWorkerGlobalScope,
  payload
) {
  try {
    const allClients = await self.clients.matchAll({
      includeUncontrolled: true,
    });
    for (const client of allClients) {
      client.postMessage(payload);
    }
  } catch (e) {
    console.log(e);
  }
}

export async function updateContent(
  self,
  { current = null, latest = null, date = null } = {},
  e
) {
  if (!current) {
    await caches.delete(contentCache);
  }
  await messageAllClients(self, {
    type: "updateStatus",
    progress: 0,
    state: "downloading",
  });

  const url = new URL(
    current
      ? `/packages/${latest}-${current}-update.zip`
      : `/packages/${latest}-content.zip`,
    UPDATES_BASE_URL
  );
  console.log(`downloading: ${url}`);
  const res = await fetch(url.toString());
  await messageAllClients(self, {
    type: "updateStatus",
    progress: 0,
    state: "unpacking",
  });

  await unpackAndCache(await res.arrayBuffer(), async (progress) => {
    await messageAllClients(self, {
      type: "updateStatus",
      progress,
      state: "unpacking",
    });
  });
  await messageAllClients(self, {
    type: "updateStatus",
    progress: 0,
    state: "init",
    currentVersion: latest,
    currentDate: date,
  });
}

async function clearContent(self: ServiceWorkerGlobalScope) {
  console.log("clearing");
  await messageAllClients(self, {
    type: "updateStatus",
    progress: 0,
    state: "clearing",
  });
  await caches.delete(contentCache);
  await messageAllClients(self, {
    type: "updateStatus",
    progress: -1,
    state: "init",
    currentVersion: null,
    currentDate: null,
  });
}

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(
    (async () => {
      const cache = await openCache();
      const { files = {} } =
        (await (await fetch("/asset-manifest.json")).json()) || {};
      const assets = [...Object.values(files)];
      await cache.addAll(assets);
    })()
  );
});

self.addEventListener("message", (e: ExtendableMessageEvent) => {
  e.waitUntil(
    (async () => {
      switch (e?.data?.type) {
        case "update":
          return updateContent(self, e?.data, e);
        case "clear":
          return clearContent(self);
        default:
          console.log(`unknown msg type: ${e?.data?.type}`);
          return Promise.resolve();
      }
    })()
  );
});

self.addEventListener("activate", (e: ExtendableEvent) => {
  e.waitUntil(async () => {
    await self.clients.claim();
    return caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key === cacheName) {
            return;
          }
          return caches.delete(key);
        })
      );
    });
  });
});
