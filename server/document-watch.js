const path = require("path");
const { Worker } = require("worker_threads");

const { SearchIndex } = require("../build");

let isReady = false;
const searchIndex = new SearchIndex();

const worker = new Worker(path.join(__dirname, "document-watch.worker.js"));
worker.on("message", (event) => {
  switch (event.type) {
    case "ready":
      isReady = true;
      searchIndex.sort();
      break;

    case "added":
    case "updated":
      searchIndex.add(event.document);
      break;

    case "deleted":
      // delete titles[event.filePath];
      break;

    default:
      console.error(new Error(`unknown event type: ${event.type}`));
  }
});

module.exports = {
  searchRoute(req, res) {
    res.json(isReady ? searchIndex.getItems()[req.params.locale] : null);
  },
};
