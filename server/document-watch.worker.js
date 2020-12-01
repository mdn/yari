const path = require("path");
const { parentPort } = require("worker_threads");

const chokidar = require("chokidar");
const glob = require("glob");

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
      path.dirname(path.relative(CONTENT_ROOT, filePath))
    );
    if (!document) {
      return;
    }

    // We check that the metadata (through `document.url`)
    // matches the filePath by using `Document.urlToFolderPath`.
    // This would prevent the document from being added in the first place
    // if the filePath doesn't map correctly to the URL, but in reverse.
    if (!filePath.includes(Document.urlToFolderPath(document.url))) {
      console.warn(
        `The slug of ${filePath} doesn't match the folder is located in.`
      );
      return;
    }

    postEvent(changeType, { filePath, document });
  } catch (e) {
    console.error(`Error while adding document ${filePath} to index:`, e);
  }
}

const NO_WATCHER = JSON.parse(process.env.REACT_APP_NO_WATCHER || "false");
const SEARCH_PATTERN = path.join(CONTENT_ROOT, "en-us", "**", "*.html");

if (NO_WATCHER) {
  const label = "Populate search-index with glob";
  console.time(label);
  let count = 0;
  glob.sync(SEARCH_PATTERN).forEach((filePath) => {
    postDocumentInfo(filePath, "added");
    count++;
  });
  postEvent("ready");
  console.timeEnd(label);
  console.log(
    `Populated search-index with ${count.toLocaleString()} found files.`
  );
} else {
  // The default is to use chokidar to constantly watch the files.

  const watcher = chokidar.watch(
    // For now, brutally hardcode it to only the 'en-us' folders
    // until we have a resolution on L10n.
    [SEARCH_PATTERN]
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
}
