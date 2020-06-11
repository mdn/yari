const fs = require("fs");
const path = require("path");

const WebSocket = require("ws");

const { Builder } = require("content/scripts/build");
const { Sources } = require("content/scripts/sources");
const {
  DEFAULT_LIVE_SAMPLES_BASE_URL,
  DEFAULT_POPULARITIES_FILEPATH,
} = require("content/scripts/constants.js");

function normalizeContentPath(start) {
  return fs.existsSync(start) ? start : path.join(__dirname, "..", start);
}

const webSocketServer = new WebSocket.Server({ port: 8080 });

const sources = new Sources();
// The server doesn't have command line arguments like the content CLI
// does so we need to entirely rely on environment variables.
if (process.env.BUILD_ROOT) {
  sources.add(normalizeContentPath(process.env.BUILD_ROOT), {
    watch: true,
  });
}
const builder = new Builder(
  sources,
  {
    destination: normalizeContentPath(
      process.env.BUILD_DESTINATION || "client/build"
    ),
    noSitemaps: true,
    specificFolders: [],
    buildJsonOnly: false,
    locales: [],
    notLocales: [],
    slugsearch: [],
    noProgressbar: true,
    foldersearch: [],
    popularitiesfile: normalizeContentPath(DEFAULT_POPULARITIES_FILEPATH),
    liveSamplesBaseUrl: DEFAULT_LIVE_SAMPLES_BASE_URL,
    onFileChange(filepath, document, root) {
      const changedFile = {
        path: filepath,
        name: path.relative(root, filepath),
      };
      const data = {
        documentURL: document.mdn_url,
        changedFile,
        hasEDITOR: Boolean(process.env.EDITOR),
      };
      webSocketServer.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
      });
    },
  },
  console
);
builder.initSelfHash();
builder.ensureAllTitles();
builder.ensureAllRedirects();
builder.prepareRoots();
builder.watch();

module.exports = { normalizeContentPath, builder };
