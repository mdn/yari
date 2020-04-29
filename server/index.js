const fs = require("fs");
const path = require("path");
const { performance } = require("perf_hooks");

const express = require("express");
const openEditor = require("open-editor");

const { Builder } = require("content/scripts/build");
const { Sources } = require("content/scripts/sources");

const app = express();

const STATIC_ROOT = path.join(__dirname, "../client/build");
const CONTENT_ALL_TITLES = path.join(__dirname, "../content/_all-titles.json");

// The client/build directory is won't exist at the very very first time
// you start the server after a fresh git clone.
if (!fs.existsSync(STATIC_ROOT)) {
  fs.mkdirSync(STATIC_ROOT);
}

function getFolderFromURI(uri) {
  // The file CONTENT_ALL_TITLES has a complete list of every *known* URI
  // and what file, on disk, it corresponds to.
  // Let's open this file dynamically each time because there's not much
  // benefit in caching it once since it might change after this server
  // has started.
  const allUris = JSON.parse(fs.readFileSync(CONTENT_ALL_TITLES));
  for (const key of Object.keys(allUris)) {
    if (key.toLowerCase() === uri.toLowerCase()) {
      return allUris[key].file;
    }
  }
  return null;
}

// A global where we stuff ALL redirects possible.
const _allRedirects = new Map();

// Return the redirect but if it can't be found, just return `undefined`
function getRedirectUrl(uri) {
  if (!_allRedirects.size && process.env.BUILD_ROOT) {
    const contentRoot = normalizeContentPath(process.env.BUILD_ROOT);
    // They're all in 1 level deep from the content root
    fs.readdirSync(contentRoot)
      .map((n) => path.join(contentRoot, n))
      .filter((filepath) => fs.statSync(filepath).isDirectory())
      .forEach((directory) => {
        fs.readdirSync(directory)
          .filter((n) => n === "_redirects.txt")
          .map((n) => path.join(directory, n))
          .forEach((filepath) => {
            const content = fs.readFileSync(filepath, "utf8");
            content.split(/\n/).forEach((line) => {
              if (line.trim().length && !line.trim().startsWith("#")) {
                const [from, to] = line.split("\t");
                // Express turns ALL URLs into lowercase. So we have to do
                // this here too to have any chance matching.
                _allRedirects.set(from.toLowerCase(), to);
              }
            });
          });
      });
  }
  return _allRedirects.get(uri) || null;
}

// Lowercase every request because every possible file we might have
// on disk is always in lowercase.
// This only helps when you're on a filesystem (e.g. Linux) that is case
// sensitive.
app.use((req, res, next) => {
  req.url = req.url.toLowerCase();
  next();
});

app.use(
  express.static(STATIC_ROOT, {
    // https://expressjs.com/en/4x/api.html#express.static
  })
);

function normalizeContentPath(start) {
  return path.join(__dirname, "..", start);
}

app.get("/_open", (req, res) => {
  const filepath = req.query.filepath;
  if (!filepath) {
    throw new Error("No .filepath in the request query");
  }
  openEditor([filepath]);
  res.status(200).send(`Tried to open ${filepath} in ${process.env.EDITOR}`);
});

// Module level memoization
let builder = null;
function getOrCreateBuilder() {
  if (!builder) {
    const sources = new Sources();
    // The server doesn't have command line arguments like the content CLI
    // does so we need to entirely rely on environment variables.
    if (process.env.BUILD_ROOT) {
      sources.add(normalizeContentPath(process.env.BUILD_ROOT));
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
        locales: [],
        notLocales: [],
        slugsearch: [],
        noProgressbar: true,
      },
      console
    );
    builder.initSelfHash();
    builder.ensureAllTitles();
    builder.ensureAllRedirects();
    builder.prepareRoots();
  }
  return builder;
}

// Catch-all
app.get("/*", async (req, res) => {
  if (req.url.startsWith("/static")) {
    res.status(404).send("Page not found");
  } else if (req.url.endsWith("/titles.json")) {
    getOrCreateBuilder().dumpAllURLs();

    // Let's see, did that generate the desired titles.json file?
    if (fs.existsSync(path.join(STATIC_ROOT, req.url))) {
      // Try now!
      res.sendFile(path.join(STATIC_ROOT, req.url));
    } else {
      res.status(404).send("Not yet");
    }
  } else if (req.url.includes("/docs/")) {
    let lookupUrl = req.url;
    let extraSuffix = "";

    if (req.url.endsWith("index.json")) {
      // It's a bit special then.
      // The URL like me something like
      // /en-US/docs/HTML/Global_attributes/index.json
      // and that won't be found in getRedirectUrl() since that doesn't
      // index things with the '/index.json' suffix. So we need to
      // temporarily remove it and remember to but it back when we're done.
      extraSuffix = "/index.json";
      lookupUrl = lookupUrl.replace(extraSuffix, "");
    }

    const redirectUrl = getRedirectUrl(lookupUrl);
    if (redirectUrl) {
      return res.redirect(301, redirectUrl + extraSuffix);
    }

    // If it wasn't a redirect, it has to be possible to build!
    const folderName = getFolderFromURI(lookupUrl);
    if (!folderName) {
      return res
        .status(404)
        .send(`Can not finder a folder based on ${lookupUrl}`);
    }
    const specificFolder = normalizeContentPath(folderName);

    // Check that it even makes sense!
    if (specificFolder) {
      const t0 = performance.now();
      try {
        const built = getOrCreateBuilder().start({
          specificFolders: [specificFolder],
        });
        const t1 = performance.now();
        console.log(
          `Successfully on-the-fly built ${built[0].jsonFile} (${(
            t1 - t0
          ).toFixed()}ms)`
        );
        if (extraSuffix == "/index.json") {
          res.sendFile(built[0].jsonFile);
        } else {
          res.sendFile(built[0].file);
        }
      } catch (ex) {
        console.error(ex);
        res.status(500).send(ex.toString());
      }
    } else {
      res
        .status(404)
        .send("Page not found. Not a redirect or a real directory");
    }
  } else {
    // This should really only be expected for "single page apps".
    // All *documents* should be handled by the
    // `if (req.url.includes("/docs/"))` test above.
    res.sendFile(path.join(STATIC_ROOT, "/index.html"));
  }
});

app.listen(5000, () => console.log("Listening on port 5000"));
