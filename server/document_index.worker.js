const path = require("path");
const { parentPort } = require("worker_threads");

const chokidar = require("chokidar");

const { ROOTS, Document } = require("content");

function postEvent(type, data = {}) {
  parentPort.postMessage({
    type,
    ...data,
    timestamp: new Date().toISOString(),
  });
}

function postDocumentInfo(filePath, changeType) {
  try {
    const root = ROOTS.find((root) => filePath.startsWith(path.resolve(root)));
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
  // For now, brutally hardcode it to only the 'en-us' folders
  // until we have a resolution on L10n.
  ROOTS.filter(Boolean).map((root) => path.join(root, "en-us", "**", "*.html"))
);

let countWatchedFiles = 0;
const t0 = new Date();
watcher.on("ready", () => {
  postEvent("ready");
  const took = new Date() - t0;
  console.log(
    `Watching over ${countWatchedFiles.toLocaleString()} files. ` +
      `Took ${(took / 1000).toFixed(1)}s to set that up.`
  );
});

watcher.on("add", (filePath) => {
  postDocumentInfo(filePath, "added");
  countWatchedFiles++;
});
watcher.on("change", (filePath) => {
  postDocumentInfo(filePath, "updated");
});

watcher.on("unlink", (filePath) => {
  postEvent("deleted", { filePath });
});
