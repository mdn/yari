/* eslint no-restricted-globals: ["off", "location"] */
/// <reference lib="WebWorker" />

import { cacheName, contentCache, openCache } from "./caches";
import { respond } from "./fetcher";
import { unpackAndCache } from "./unpack-cache";
import { offlineDb } from "./db";
import { fetchWithExampleOverride } from "./fetcher";

export const INTERACTIVE_EXAMPLES_URL = new URL(
  "https://interactive-examples.mdn.mozilla.net"
);
export const LIVE_SAMPLES_URL = new URL(
  "https://yari-demos.prod.mdn.mozit.cloud"
);
export const USER_CONTENT_URL = new URL("https://mozillausercontent.com");

const UPDATES_BASE_URL = `https://updates.${
  location.hostname === "localhost" ? "developer.allizom.org" : location.host
}`;

// export empty type because of tsc --isolatedModules flag
export type {};
declare const self: ServiceWorkerGlobalScope;

self.addEventListener("install", (e) => {
  // synchronizeDb();
  e.waitUntil(
    (async () => {
      const cache = await openCache();
      const { files = {} } =
        (await (await fetch("/asset-manifest.json")).json()) || {};
      const assets = [...Object.values(files)].filter(
        (asset) => !(asset as string).endsWith(".map")
      );
      await cache.addAll(assets as string[]);
    })().then(() => self.skipWaiting())
  );
});

self.addEventListener("fetch", (e) => {
  const preferOnline =
    new URLSearchParams(location.search).get("preferOnline") === "true";
  if (
    preferOnline &&
    !e.request.url.includes("/api/v1/") &&
    !e.request.url.includes("/users/fxa/")
  ) {
    e.respondWith(
      (async () => {
        const res = await fetchWithExampleOverride(e.request);
        if (res.ok) {
          return res;
        }
        return respond(e);
      })()
    );
  } else {
    e.respondWith(respond(e));
  }
  if (e.request.method === "POST") {
    synchronizeDb();
  }
});

self.addEventListener("message", (e: ExtendableMessageEvent) => {
  e.waitUntil(
    (async () => {
      switch (e?.data?.type) {
        case "update":
          return updateContent(self, e?.data, e);
        case "clear":
          return clearContent(self);
        case "ping":
          return await messageAllClients(self, { type: "pong" });
        default:
          console.log(`unknown msg type: ${e?.data?.type}`);
          return Promise.resolve();
      }
    })()
  );
});

self.addEventListener("activate", (e: ExtendableEvent) => {
  e.waitUntil(
    (async () => {
      await self.clients.claim();
      return caches.keys().then((keyList) => {
        return Promise.all(
          keyList.map((key) => {
            if (key === cacheName || key === contentCache) {
              return Promise.resolve(true);
            }
            return caches.delete(key);
          })
        );
      });
    })()
  );
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
    console.error(e);
  }
}

var updating = false;

export async function updateContent(
  self,
  { current = null, latest = null, date = null } = {},
  e
) {
  if (updating) {
    return;
  } else {
    updating = true;
  }
  try {
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
    console.log(`[update] downloading: ${url}`);
    const res = await fetch(url.href);
    const buf = await res.arrayBuffer();

    console.log(`[update] unpacking: ${url}`);
    await messageAllClients(self, {
      type: "updateStatus",
      progress: 0,
      state: "unpacking",
    });

    await unpackAndCache(buf, async (progress) => {
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

    await synchronizeDb();

    console.log(`[update] done`);
    updating = false;
  } catch (e) {
    console.error(e);
    updating = false;
  }
}

async function clearContent(self: ServiceWorkerGlobalScope) {
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

async function synchronizeDb() {
  const NOTIFICATIONS_BASE_PATH = "/api/v1/plus/notifications";
  const WATCHED_BASE_PATH = "/api/v1/plus/watching";
  const PATH_COLLECTIONS = "/api/v1/plus/collection";

  fetchAllLimitOffset(NOTIFICATIONS_BASE_PATH)
    .then(async (update) => {
      await offlineDb.notifications.clear();
      await offlineDb.notifications.bulkPut(update);
    })
    .catch((err) => console.log(`Offline, skip sync`));

  fetchAllLimitOffset(WATCHED_BASE_PATH)
    .then(async (update) => {
      await offlineDb.watched.clear();
      await offlineDb.watched.bulkPut(update);
    })
    .catch((err) => console.log(`Offline, skip sync`));

  fetchAllPaged(PATH_COLLECTIONS)
    .then(async (update) => {
      await offlineDb.collections.clear();
      await offlineDb.collections.bulkPut(update);
    })
    .catch((err) => console.log(`Offline, skip sync`));
}

async function fetchAllLimitOffset(path: string) {
  let offset = 0;
  let limit = 50;
  let items = 50;
  let update = [];
  while (items === limit) {
    const res = await fetch(`${path}/?limit=${limit}&offset=${offset}`);
    const body = await res.json();
    items = body.items?.length;
    offset += body.items?.length;
    if (items) {
      update = [...update, ...body.items];
    }
  }
  return update;
}

async function fetchAllPaged(path: string) {
  const limit = 50;
  let page = 1;
  let items = 50;
  let update = [];
  while (items === limit) {
    const res = await fetch(`${path}/?limit=${limit}&page=${page}`);
    const body = await res.json();
    items = body.items?.length;
    page += 1;
    if (items) {
      update = [...update, ...body.items];
    }
  }
  return update;
}
