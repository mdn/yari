const path = require("path");
const { parentPort } = require("worker_threads");

const chokidar = require("chokidar");

const { CONTENT_ROOT, CONTENT_ARCHIVE_ROOT, Document } = require("content");

function postEvent(type, data = {}) {
  parentPort.postMessage({
    type,
    ...data,
    timestamp: new Date().toISOString(),
  });
}

function postDocumentInfo(filePath, changeType) {
  try {
    const root = [CONTENT_ROOT, CONTENT_ARCHIVE_ROOT].find((root) =>
      filePath.startsWith(path.resolve(root))
    );
    const document = Document.read(
      path.dirname(path.relative(root, filePath)),
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
        isArchive: document.isArchive,
      },
    });
  } catch (e) {
    console.error(`Error while adding document ${filePath} to index:`, e);
  }
}

const watcher = chokidar.watch(
  [CONTENT_ROOT, CONTENT_ARCHIVE_ROOT]
    .filter(Boolean)
    .map((root) => path.join(root, "**", "*.html"))
);

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
