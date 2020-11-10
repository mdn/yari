const path = require("path");
const { SearchIndex } = require("../build");

let isReady = false;
const searchIndex = new SearchIndex();

if (process.env.REACT_APP_NO_WATCHER) {
  const glob = require("glob");
  const { CONTENT_ROOT, Document } = require("../content");

  const files = glob.sync(path.join(CONTENT_ROOT, "en-us", "**", "*.html"));
  let docCount = 0;
  for (const file of files) {
    const document = Document.read(
      path.dirname(path.relative(CONTENT_ROOT, file))
    );
    searchIndex.add(document);
    docCount += 1;
  }
  isReady = true;
  console.info(`Added ${docCount} document to the search index.`);
} else {
  const { Worker } = require("worker_threads");
  const WebSocket = require("ws");
  const webSocketServer = new WebSocket.Server({ port: 8080 });

  const sendWebSocketMessage = (message) => {
    for (const client of webSocketServer.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    }
  };

  const worker = new Worker(path.join(__dirname, "document-watch.worker.js"));
  worker.on("message", (event) => {
    switch (event.type) {
      case "ready":
        isReady = true;
        searchIndex.sort();
        sendWebSocketMessage({ type: "SEARCH_INDEX_READY" });
        break;

      case "added":
      case "updated":
        searchIndex.add(event.document);
        if (isReady) {
          sendWebSocketMessage({
            type: "DOCUMENT_CHANGE",
            hasEditorSet: Boolean(process.env.EDITOR),
            change: event,
          });
        }
        break;

      case "deleted":
        // delete titles[event.filePath];
        break;

      default:
        console.error(new Error(`unknown event type: ${event.type}`));
    }
  });
}

module.exports = {
  searchRoute(req, res) {
    res.json(isReady ? searchIndex.getItems()[req.params.locale] : null);
  },
};
