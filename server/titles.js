const { Worker, isMainThread, parentPort } = require("worker_threads");
const path = require("path");

const chokidar = require("chokidar");

const { CONTENT_ROOT, Document } = require("content");

if (isMainThread) {
  let titles = null;

  const worker = new Worker(__filename);
  worker.on("message", (data) => {
    titles = data;
  });

  module.exports = (req, res) => res.json({ titles });
} else {
  const popularities = require("./popularities.json");

  const titles = {};
  let isReady = false;

  function getFolder(filePath) {
    return path.dirname(path.relative(CONTENT_ROOT, filePath));
  }

  function sendTitles() {
    if (isReady) {
      parentPort.postMessage(Object.values(titles));
    }
  }

  function addOrUpdateDocument(filePath) {
    try {
      const document = Document.read(getFolder(filePath), { metadata: true });
      if (!document) {
        return;
      }
      const { metadata, url } = document;

      titles[filePath] = {
        url,
        title: metadata.title,
        popularity: popularities[url] || 0,
      };

      sendTitles();
    } catch (e) {
      console.error(`Error while adding document ${filePath} to index:`, e);
    }
  }

  const watcher = chokidar.watch(CONTENT_ROOT, "**/*.html");

  watcher.on("ready", () => {
    isReady = true;
    sendTitles();
  });

  watcher.on("add", addOrUpdateDocument);
  watcher.on("change", addOrUpdateDocument);

  watcher.on("unlink", (filePath) => {
    delete titles[filePath];
    sendTitles();
  });
}
