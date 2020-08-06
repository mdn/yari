const path = require("path");
const { parentPort } = require("worker_threads");

const chokidar = require("chokidar");

const { CONTENT_ROOT, Document } = require("../content");

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

    postEvent(changeType, { filePath, document });
  } catch (e) {
    console.error(`Error while adding document ${filePath} to index:`, e);
  }
}

const watcher = chokidar.watch(
  // For now, brutally hardcode it to only the 'en-us' folders
  // until we have a resolution on L10n.
  [path.join(CONTENT_ROOT, "en-us", "**", "*.html")]
);

const label = "Set up file watcher";
console.time(label);
watcher.on("ready", () => {
  postEvent("ready");
  console.timeEnd(label);
  console.log(
    `Watching over ${Object.keys(
      watcher.getWatched()
    ).length.toLocaleString()} files.`
  );
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
