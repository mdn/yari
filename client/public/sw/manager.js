const INTERACTIVE_EXAMPLES_URL =
  "https://interactive-examples.stage.mdn.mozilla.net";
const UPDATES_BASE_URL = "https://updates.developer.allizom.org";

importScripts("./sw/caches.js");
importScripts("./sw/api.js");
importScripts("./sw/unpack-cache.js");

function jsonBlob(json) {
  return new Blob([JSON.stringify(json, null, 2)], {
    type: "application/json",
  });
}

async function messageAllClients(payload) {
  const allClients = await self.clients.matchAll();
  for (const client of allClients) {
    client.postMessage(payload);
  }
}

async function updateContent({ current, latest, date } = {}, e) {
  if (!current) {
    await caches.delete(contentCache);
  }
  await messageAllClients({
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
  const res = await fetch(url);
  await messageAllClients({
    type: "updateStatus",
    progress: 0,
    state: "unpacking",
  });

  await unpackAndCache(await res.arrayBuffer(), async (progress) => {
    await messageAllClients({
      type: "updateStatus",
      progress,
      state: "unpacking",
    });
  });
  await messageAllClients({
    type: "updateStatus",
    progress: 0,
    state: "init",
    currentVersion: latest,
    currentDate: date,
  });
}

async function clearContent() {
  console.log("clearing");
  await messageAllClients({
    type: "updateStatus",
    progress: 0,
    state: "clearing",
  });
  await caches.delete(contentCache);
  await messageAllClients({
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

self.addEventListener("message", (e) => {
  e.waitUntil(
    (async () => {
      switch (e?.data?.type) {
        case "update":
          return updateContent(e?.data, e);
        case "clear":
          return clearContent();
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
