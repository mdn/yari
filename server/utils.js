const fs = require("fs");
const path = require("path");

const { Builder } = require("content/scripts/build");
const { Sources } = require("content/scripts/sources");
const {
  DEFAULT_LIVE_SAMPLES_BASE_URL,
  DEFAULT_POPULARITIES_FILEPATH,
} = require("content/scripts/constants.js");

function normalizeContentPath(start) {
  return fs.existsSync(start) ? start : path.join(__dirname, "..", start);
}

// Module level memoization
let builder = null;
function getOrCreateBuilder(options) {
  options = options || {};
  if (!builder) {
    const sources = new Sources();
    // The server doesn't have command line arguments like the content CLI
    // does so we need to entirely rely on environment variables.
    if (process.env.BUILD_ROOT) {
      sources.add(normalizeContentPath(process.env.BUILD_ROOT), {
        watch: true,
      });
    }
    builder = new Builder(
      sources,
      {
        destination: normalizeContentPath(
          process.env.BUILD_DESTINATION || "client/build"
        ),
        noSitemaps: true,
        specificFolders: [],
        buildJsonOnly: false,
        locales: options.locales || [],
        notLocales: [],
        slugsearch: [],
        noProgressbar: true,
        foldersearch: options.foldersearch || [],
        popularitiesfile: normalizeContentPath(DEFAULT_POPULARITIES_FILEPATH),
        liveSamplesBaseUrl: DEFAULT_LIVE_SAMPLES_BASE_URL,
      },
      console
    );
    builder.initSelfHash();
    builder.ensureAllTitles();
    builder.ensureAllRedirects();
    builder.prepareRoots();
    builder.watch();
  }
  return builder;
}

getOrCreateBuilder();

module.exports = { normalizeContentPath, getOrCreateBuilder };
