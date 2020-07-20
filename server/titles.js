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
  const titles = {};

  function getFolder(filePath) {
    return path.dirname(path.relative(CONTENT_ROOT, filePath));
  }

  const popularities = require("./popularities.json");

  const watcher = chokidar.watch(CONTENT_ROOT, "**/*.html");

  watcher.on("ready", () => {
    parentPort.postMessage(titles);
  });

  watcher.on("add", (filePath) => {
    try {
      const document = Document.read(getFolder(filePath), { metadata: true });
      if (!document) {
        return;
      }
      const { metadata, url } = document;
      const locale = url.split("/")[1];

      titles[url] = {
        title: metadata.title,
        popularity: popularities[url] || 0,
      };
    } catch (e) {
      console.error(`Error while adding document ${filePath} to index:`, e);
    }
  });

  watcher.on("unlink", (filepath) => {
    const { url } = Document.read(getFolder(filepath), { metadata: true });
    delete titles[url];
    parentPort.postMessage(titles);
  });
}
