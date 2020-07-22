const path = require("path");
const { Worker, isMainThread, parentPort } = require("worker_threads");

const chokidar = require("chokidar");
const express = require("express");

const { CONTENT_ROOT, Document } = require("content");

if (isMainThread) {
  const router = express();

  let isReady = false;

  const titles = {};

  let changes = [];
  function addChange(event) {
    changes = [event, ...changes].slice(0, 10);
  }

  const worker = new Worker(__filename);
  worker.on("message", (event) => {
    switch (event.type) {
      case "ready":
        isReady = true;
        break;

      case "added":
      case "updated":
        titles[event.filePath] = event.documentInfo;
        if (isReady) {
          addChange(event);
        }
        break;

      case "deleted":
        delete titles[event.filePath];
        addChange(event);
        break;

      default:
        console.error(new Error(`unknown event type: ${event.type}`));
    }
  });

  router.get("/titles", (req, res) =>
    res.json({ isReady, titles: Object.values(titles) })
  );

  router.get("/changes", (req, res) =>
    res.json({ hasEditorSet: Boolean(process.env.EDITOR), changes })
  );

  module.exports = router;
} else {
  const popularities = require("./popularities.json");

  function postEvent(type, data = {}) {
    parentPort.postMessage({
      type,
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  function postDocumentInfo(filePath, changeType) {
    try {
      const document = Document.read(
        path.dirname(path.relative(CONTENT_ROOT, filePath)),
        { metadata: true }
      );
      if (!document) {
        return;
      }
      const { metadata, url } = document;

      postEvent(changeType, {
        filePath,
        documentInfo: {
          url,
          title: metadata.title,
          popularity: popularities[url] || 0,
        },
      });
    } catch (e) {
      console.error(`Error while adding document ${filePath} to index:`, e);
    }
  }

  const watcher = chokidar.watch(CONTENT_ROOT, "**/*.html");

  watcher.on("ready", () => {
    postEvent("ready");
  });

  watcher.on("add", (filePath) => {
    postDocumentInfo(filePath, "added");
  });
  watcher.on("change", (filePath) => {
    postDocumentInfo(filePath, "updated");
  });

  watcher.on("unlink", (filePath) => {
    postEvent("deleted", { filePath });
  });
}
