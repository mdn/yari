/* eslint no-restricted-globals: ["off", "location"] */
/// <reference lib="WebWorker" />

import { cacheName, contentCache, openCache } from "./caches";
import { respond } from "./fetcher";
import { unpackAndCache } from "./unpack-cache";
import {
  ContentStatusPhase,
  getContentStatus,
  offlineDb,
  patchContentStatus,
  RemoteContentStatus,
  SwType,
} from "./db";
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

const SW_TYPE: SwType =
  SwType[new URLSearchParams(location.search).get("type")] || SwType.ApiOnly;

// export empty type because of tsc --isolatedModules flag
export type {};
declare const self: ServiceWorkerGlobalScope;

var unpacking = Promise.resolve();

self.addEventListener("install", (e) => {
  // synchronizeDb();
  e.waitUntil(
    SW_TYPE === SwType.ApiOnly
      ? self.skipWaiting()
      : (async () => {
          const cache = await openCache();
          const { files = {} } =
            (await (await fetch("/asset-manifest.json")).json()) || {};
          const assets = [...Object.values(files)].filter(
            (asset) => !(asset as string).endsWith(".map")
          );
          await cache.addAll(assets as string[]);
        })().then(() => self.skipWaiting())
  );

  initOncePerRun(self);
});

self.addEventListener("fetch", (e) => {
  if (
    (SW_TYPE === SwType.ApiOnly || SW_TYPE === SwType.PreferOnline) &&
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
      initOncePerRun(self);

      switch (e?.data?.type) {
        case "checkForUpdate":
          return checkForUpdate(self);

        case "update":
          unpacking = updateContent(self);
          return unpacking;

        case "clear":
          return clearContent(self);

        case "ping":
          return await messageAllClients(self, { type: "pong" });

        case "keepalive":
          console.log("[keepalive]");
          return unpacking;

        default:
          console.log(`unknown msg type: ${e?.data?.type}`);
          return Promise.resolve();
      }
    })()
  );
});

var isRunning = false;
async function initOncePerRun(self: ServiceWorkerGlobalScope) {
  if (isRunning) {
    return;
  } else {
    isRunning = true;
  }

  await patchContentStatus({
    phase: ContentStatusPhase.IDLE,
    progress: null,
  });
}

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

function isRemoteContentStatus(remote: unknown): remote is RemoteContentStatus {
  return (
    typeof remote === "object" &&
    typeof remote["latest"] === "string" &&
    typeof remote["date"] === "string" &&
    Array.isArray(remote["updates"])
  );
}

var updating = false;

export async function checkForUpdate(self: ServiceWorkerGlobalScope) {
  if (updating) {
    return;
  }

  console.log("[checkForUpdate]");
  const res = await fetch(`${UPDATES_BASE_URL}/update.json`);
  const remote = await res.json();

  if (!remote) {
    console.error(`[checkForUpdate] Failed to fetch remote status!`, res);
    return;
  } else if (!isRemoteContentStatus(remote)) {
    console.warn(`[checkForUpdate] Got unsupported remote status:`, remote);
    return;
  }

  await patchContentStatus({
    remote,
  });
}

export async function updateContent(self: ServiceWorkerGlobalScope) {
  await checkForUpdate(self);

  const contentStatus = await getContentStatus();

  const { local, remote } = contentStatus;

  if (!remote || (local && local.version === remote.latest)) {
    return;
  }

  if (updating) {
    return;
  } else {
    updating = true;
  }

  try {
    await patchContentStatus({
      phase: ContentStatusPhase.DOWNLOAD,
    });

    const useDiff = local && remote.updates.includes(local.version);

    const url = new URL(
      useDiff
        ? `/packages/${remote.latest}-${local.version}-update.zip`
        : `/packages/${remote.latest}-content.zip`,
      UPDATES_BASE_URL
    );

    console.log(`[update] downloading: ${url}`);
    const res = await fetch(url.href);
    const buf = await res.arrayBuffer();

    if (!useDiff) {
      console.log(`[update] clearing old content`);
      await deleteContentCache();
    }

    console.log(`[update] unpacking`);
    await patchContentStatus({
      phase: ContentStatusPhase.UNPACK,
      progress: 0,
    });

    await unpackAndCache(buf, async (progress) => {
      await patchContentStatus({
        phase: ContentStatusPhase.UNPACK,
        progress: progress,
      });
    });

    await patchContentStatus({
      phase: ContentStatusPhase.IDLE,
      local: {
        version: remote.latest,
        date: remote.date,
      },
      progress: null,
    });

    console.log(`[update] synchronizing`);
    await synchronizeDb();

    console.log(`[update] done`);
  } catch (e) {
    console.error(`[update] failed`, e);

    await patchContentStatus({
      phase: ContentStatusPhase.IDLE,
      progress: null,
    });
  } finally {
    updating = false;
  }
}

async function clearContent(self: ServiceWorkerGlobalScope) {
  const contentStatus = await getContentStatus();

  if (contentStatus.phase === ContentStatusPhase.CLEAR) {
    return;
  }

  try {
    await patchContentStatus({
      phase: ContentStatusPhase.CLEAR,
    });

    console.log(`[clear] deleting`);
    const success = await deleteContentCache();
    console.log(`[clear] done: ${success}`);
  } catch (e) {
    console.error(`[clear] failed`, e);
  } finally {
    await patchContentStatus({
      phase: ContentStatusPhase.IDLE,
    });
  }
}

async function deleteContentCache() {
  await patchContentStatus({
    local: null,
  });
  return await caches.delete(contentCache);
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
