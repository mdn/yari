/* eslint no-restricted-globals: ["off", "location"] */
/// <reference lib="WebWorker" />

import { cacheName, contentCache, openCache } from "./caches.js";
import { respond } from "./fetcher.js";
import { unpackAndCache } from "./unpack-cache.js";
import {
  ContentStatusPhase,
  getContentStatus,
  patchContentStatus,
  RemoteContentStatus,
  SwType,
} from "./db.js";
import { fetchWithExampleOverride } from "./fetcher.js";

export const INTERACTIVE_EXAMPLES_URL = new URL(
  "https://interactive-examples.mdn.mozilla.net"
);
export const LIVE_SAMPLES_URL = new URL("https://live-samples.mdn.mozilla.net");
export const USER_CONTENT_URL = new URL("https://mozillausercontent.com");

const UPDATES_BASE_URL = `https://updates.${
  location.hostname === "localhost" ? "developer.allizom.org" : location.host
}`;

const SW_TYPE: SwType =
  SwType[new URLSearchParams(location.search).get("type")] ||
  SwType.PreferOnline;

// export empty type because of tsc --isolatedModules flag
export type {};
declare const self: ServiceWorkerGlobalScope;

var unpacking = Promise.resolve();

self.addEventListener("install", (e) => {
  e.waitUntil(
    (async () => {
      const cache = await openCache();
      const { files = {} }: { files: object } =
        (await (
          await fetch("/asset-manifest.json", { cache: "no-cache" })
        ).json()) || {};
      const assets = [...Object.values(files)].filter(
        (asset) => !(asset as string).endsWith(".map")
      );
      let keys = new Set(
        (await cache.keys()).map((r) => r.url.replace(location.origin, ""))
      );
      const toCache = assets.filter((file) => !keys.has(file));
      await cache.addAll(toCache as string[]);
    })().then(() => self.skipWaiting())
  );

  initOncePerRun(self);
});

self.addEventListener("fetch", async (e) => {
  const url = new URL(e.request.url);
  if (
    SW_TYPE === SwType.PreferOnline &&
    !url.pathname.startsWith("/api/") &&
    !url.pathname.startsWith("/users/fxa/")
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
