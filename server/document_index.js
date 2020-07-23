const { Worker } = require("worker_threads");

const express = require("express");

const popularities = require("./popularities.json");

const router = express();

let isReady = false;

const titles = [];

let changes = [];
function addChange(event) {
  changes = [event, ...changes].slice(0, 10);
}

const getPopularity = (document) =>
  document.isArchive ? -1 : popularities[document.url] || 0;

const worker = new Worker("./document_index.worker.js");
worker.on("message", (event) => {
  switch (event.type) {
    case "ready":
      isReady = true;
      titles.sort((a, b) => getPopularity(b) - getPopularity(a));
      break;

    case "added":
    case "updated":
      const {
        url,
        metadata: { title },
      } = event.document;
      titles.unshift({ url, title });
      if (isReady) {
        addChange(event);
      }
      break;

    case "deleted":
      // delete titles[event.filePath];
      addChange(event);
      break;

    default:
      console.error(new Error(`unknown event type: ${event.type}`));
  }
});

router.get("/titles", (req, res) => {
  res.json({ isReady, titles });
});

router.get("/changes", (req, res) => {
  res.json({ hasEditorSet: Boolean(process.env.EDITOR), isReady, changes });
});

module.exports = router;
