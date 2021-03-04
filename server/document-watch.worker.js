const fs = require("fs");
const path = require("path");
const { parentPort } = require("worker_threads");

const { CONTENT_ROOT, Document } = require("../content");

function* walker(root) {
  const files = fs.readdirSync(root);
  for (const name of files) {
    const filepath = path.join(root, name);
    const isDirectory = fs.statSync(filepath).isDirectory();
    if (isDirectory) {
      yield* walker(filepath);
    } else {
      yield filepath;
    }
  }
}

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
    postEvent(changeType, { filePath, document });
  } catch (e) {
    console.error(`Error while adding document ${filePath} to index:`, e);
  }
}

const SEARCH_ROOT = path.join(CONTENT_ROOT, "en-us");

const label = "Populate search-index";
console.time(label);
let count = 0;
for (const filePath of walker(SEARCH_ROOT)) {
  const basename = path.basename(filePath);
  if (basename === "index.html" || basename === "index.md") {
    postDocumentInfo(filePath, "added");
    count++;
  }
}
postEvent("ready");
console.timeEnd(label);
console.log(`Populated search-index found ${count.toLocaleString()} files.`);
