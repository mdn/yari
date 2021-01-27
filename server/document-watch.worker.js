const path = require("path");
const { parentPort } = require("worker_threads");

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

const SEARCH_PATTERN = path.join(CONTENT_ROOT, "en-us", "**", "*.html");

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
