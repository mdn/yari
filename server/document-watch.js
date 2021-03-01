const path = require("path");
const { Worker } = require("worker_threads");

const { SearchIndex } = require("../build");

let isReady = false;
const searchIndex = new SearchIndex();

const worker = new Worker(path.join(__dirname, "document-watch.worker.js"));
worker.on("message", (event) => {
  switch (event.type) {
    case "ready":
      searchIndex.sort();
      isReady = true;
      break;

    case "added":
    case "updated":
      searchIndex.add(event.document);
      break;

    case "deleted":
      // delete titles[event.filePath];
      break;

    default:
      console.error(new Error(`unknown event type: ${event.type}`));
  }
});

// The `seachRoute` handler depends on a global boolean. That global boolean is
// changed by the worker.
// If it's not ready by the time someone queries this endpoint, the chances are
// they will be if we just let the worker a little bit more time.
// The max time the handler might take is `(MAX_RETRIES + 1) * RETRY_SLEEPTIME`.
// This was added because sometimes, when you start up Yari, the Express server
// is started and ready before the worker has indexed all the known files and if
// you're really quick to get to the title auto-complete search widget, you
// can get some strange results. This isn't just a risk when you start Yari for the
// first time, but also every time `nodemon` notices a change in the server
// related code which triggers a restart of `SearchIndex`.
const MAX_RETRIES = 3;
const RETRY_SLEEPTIME = 1000;

function searchRoute(req, res, retry = 0) {
  if (isReady) {
    res.json(isReady ? searchIndex.getItems()[req.params.locale] : null);
  } else {
    if (retry > MAX_RETRIES) {
      // So many retries and it's still not ready. Something must have gone wrong.
      res
        .status(500)
        .send(`Search index is still not ready after after ${retry} retries`);
    } else {
      setTimeout(() => {
        searchRoute(req, res, retry + 1);
      }, RETRY_SLEEPTIME);
    }
  }
}

module.exports = {
  searchRoute,
};
