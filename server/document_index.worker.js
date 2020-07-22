const path = require("path");
const { parentPort } = require("worker_threads");

const chokidar = require("chokidar");

const { CONTENT_ROOT, Document } = require("content");

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
      document: {
        url,
        metadata,
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
