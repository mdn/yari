const fs = require("fs");
const path = require("path");
const { performance } = require("perf_hooks");

const express = require("express");
const openEditor = require("open-editor");

const { Builder } = require("content/scripts/build");
const { Sources } = require("content/scripts/sources");
const {
  DEFAULT_POPULARITIES_FILEPATH,
  FLAW_LEVELS,
} = require("content/scripts/constants.js");

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

    if (!_allRedirects.size) {
      throw new Error(`Unable to gather any redirects from ${contentRoot}`);
    }
  }

  return _allRedirects.get(uri.toLowerCase()) || null;
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
  const { line, column, filepath } = req.query;
  if (!filepath) {
    throw new Error("No .filepath in the request query");
  }
  const absoluteFilepath = normalizeContentPath(filepath);
  let spec = absoluteFilepath;
  if (line) {
    spec += `:${parseInt(line)}`;
    if (column) {
      spec += `:${parseInt(column)}`;
    }
  }
  openEditor([spec]);
  res.status(200).send(`Tried to open ${spec} in ${process.env.EDITOR}`);
});

// Module level memoization
let builder = null;
function getOrCreateBuilder(options) {
  options = options || {};
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
        // popularitiesfiles: process.env.BUILD_POPULARITIES_FILEPATH,
        noSitemaps: true,
        specificFolders: [],
        buildJsonOnly: false,
        locales: options.locales || [],
        notLocales: [],
        slugsearch: [],
        noProgressbar: true,
        foldersearch: options.foldersearch || [],
        popularitiesfile: normalizeContentPath(DEFAULT_POPULARITIES_FILEPATH),
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

// Return about redirects based on a list of URLs.
// This is used by the "<Flaws/>" component which displays information
// about broken links in a page, as some of those broken links might just
// be redirects.
app.get("/_redirects", (req, res) => {
  redirects = {};
  for (const url of req.query.url) {
    redirects[url] = getRedirectUrl(url);
  }
  res.json({ redirects });
});

app.get("/_flaws", (req, res) => {
  const locale = req.query.locale.toLowerCase();
  if (!locale) {
    return res.status(400).send("'locale' is always required");
  }
  const filters = req.query;

  let page;
  try {
    page = parseInt(req.query.page || "1");
    if (page < 1) {
      return res.status(400).send("'page' number too small");
    }
  } catch (err) {
    return res.status(400).send("'page' number invalid");
  }

  let [popularityFilter, error] = validPopularityFilter(filters.popularity);
  if (error) {
    return res.status(400).send(error.toString());
  }

  const sortBy = req.query.sort || "popularity";
  const sortReverse = JSON.parse(req.query.reverse || "false");

  const MAX_DOCUMENTS_RETURNED = 25;

  const counts = {
    // Number of documents found with the matching flaws
    found: 0,
    // Number of documents that can be built independent of how many have
    // been built.
    possible: 0,
    // Number of documents that have been built.
    // Basically a count of client/build/**/index.json files.
    built: 0,
    // Used by the pagination
    pages: 0,
  };

  const documents = [];

  const builder = getOrCreateBuilder();
  for (const data of builder.allTitles.values()) {
    if (data.locale && data.locale.toLowerCase() === locale) {
      counts.possible++;
    }
  }

  const allPopularitiesValues = [];
  for (const value of builder.allTitles.values()) {
    if (value.popularity) {
      allPopularitiesValues.push(value.popularity);
    }
  }
  allPopularitiesValues.sort((a, b) => b - a);

  // Some flaws *values* are overly verbose
  function packageFlaws(flawsObj) {
    const packaged = [];
    const keys = Object.keys(flawsObj);
    keys.sort();
    for (const name of keys) {
      let value = flawsObj[name];
      if (Array.isArray(value)) {
        value = value.length;
      }
      packaged.push({ name, value });
    }
    return packaged;
  }

  // We can't just open the `index.json` and return it like that in the XHR
  // payload. It's too much stuff and some values need to be repackaged/
  // serialized or some other transformation computation.
  function packageDocument(folder, doc) {
    const { modified, mdn_url, title } = doc;
    const popularity = {
      value: doc.popularity,
      ranking: doc.popularity
        ? 1 + allPopularitiesValues.filter((p) => p > doc.popularity).length
        : NaN,
    };
    const flaws = packageFlaws(doc.flaws);
    return Object.assign(
      { folder, popularity, flaws },
      { modified, mdn_url, title }
    );
  }

  const t1 = new Date();

  let filteredFlaws = new Set();
  if (filters.flaws) {
    if (Array.isArray(filters.flaws)) {
      filteredFlaws = new Set(filters.flaws);
    } else {
      filteredFlaws = new Set([filters.flaws]);
    }
  }

  // The Builder instance doesn't know about traversing all the built
  // documents, but it *does* know *where* to look.
  for (const [folder, files] of walker(
    path.join(builder.destination, locale)
  )) {
    if (files.includes("index.json")) {
      counts.built++;

      const { doc } = JSON.parse(
        fs.readFileSync(path.join(folder, "index.json"))
      );

      if (doc.flaws && Object.keys(doc.flaws).length) {
        if (
          filters.mdn_url &&
          !doc.mdn_url.toLowerCase().includes(filters.mdn_url.toLowerCase())
        ) {
          continue;
        }
        if (filteredFlaws.size) {
          if (!Object.keys(doc.flaws).some((x) => filteredFlaws.has(x))) {
            continue;
          }
        }

        if (popularityFilter) {
          const docRanking = doc.popularity
            ? 1 + allPopularitiesValues.filter((p) => p > doc.popularity).length
            : NaN;
          if (popularityFilter.min) {
            if (isNaN(docRanking) || docRanking > popularityFilter.min) {
              continue;
            }
          } else if (popularityFilter.max) {
            if (docRanking < popularityFilter.max) {
              continue;
            }
          }
        }
        counts.found++;
        documents.push(packageDocument(folder, doc));
      }
    }
  }

  // Now we know how many documents were found, update the number of pages
  // based on the batch size.
  counts.pages = Math.ceil(counts.found / MAX_DOCUMENTS_RETURNED);

  const sortMultiplier = sortReverse ? -1 : 1;
  documents.sort((a, b) => {
    switch (sortBy) {
      case "popularity":
        return (
          sortMultiplier *
          ((b.popularity.value || 0) - (a.popularity.value || 0))
        );
      case "flaws":
        // This is kinda bogus and slow.
        const vA = a.flaws.reduce((x, y) => x + y.value, 0);
        const vB = b.flaws.reduce((x, y) => x + y.value, 0);
        return sortMultiplier * (vB - vA);
      case "mdn_url":
        if (a.mdn_url.toLowerCase() < b.mdn_url.toLowerCase()) {
          return sortMultiplier * -1;
        } else if (a.mdn_url.toLowerCase() > b.mdn_url.toLowerCase()) {
          return sortMultiplier * 1;
        } else {
          return 0;
        }
      default:
        throw new Error("not implemented");
    }
  });

  const t2 = new Date();

  const times = {
    built: t2.getTime() - t1.getTime(),
  };

  // Prepare to slice per the page number
  let [m, n] = [
    (page - 1) * MAX_DOCUMENTS_RETURNED,
    page * MAX_DOCUMENTS_RETURNED,
  ];

  res.json({
    counts,
    times,
    flawLevels: serializeFlawLevels(builder.options.flawLevels),

    // The slicing is just to make the payload more manageable
    documents: documents.slice(m, n),
  });
});

function validPopularityFilter(value) {
  let filter = null;
  if (value) {
    if (/[^\d<>]/.test(value)) {
      return [null, "popularity contains unrecognized characters"];
    }
    if (value.startsWith("<")) {
      filter = { min: parseInt(value.slice(1).trim()) };
    } else if (value.startsWith(">")) {
      filter = { max: parseInt(value.slice(1).trim()) };
    } else {
      throw new Error("Not implemented");
    }
  }
  return [filter, null];
}

function serializeFlawLevels(flawLevels) {
  const keys = [...flawLevels.keys()];
  keys.sort();
  return keys.map((key) => {
    return {
      name: key,
      level: flawLevels.get(key),
      ignored: flawLevels.get(key) === FLAW_LEVELS.IGNORE,
    };
  });
}

function* walker(root, depth = 0) {
  const files = fs.readdirSync(root);
  if (!depth) {
    yield [
      root,
      files.filter((name) => {
        return !fs.statSync(path.join(root, name)).isDirectory();
      }),
    ];
  }
  for (const name of files) {
    const filepath = path.join(root, name);
    const isDirectory = fs.statSync(filepath).isDirectory();
    if (isDirectory) {
      yield [
        filepath,
        fs.readdirSync(filepath).filter((name) => {
          return !fs.statSync(path.join(filepath, name)).isDirectory();
        }),
      ];
      // Now go deeper
      yield* walker(filepath, depth + 1);
    }
  }
}

// Catch-all
app.get("/*", async (req, res) => {
  if (req.url.startsWith("_")) {
    // URLs starting with _ is exclusively for the meta-work and if there
    // isn't already a handler, it's something wrong.
    return res.status(404).send("Page not found");
  }

  // If the catch-all gets one of these something's gone wrong
  if (req.url.startsWith("/static")) {
    return res.status(404).send("Page not found");
  }

  if (req.url.endsWith("/titles.json")) {
    getOrCreateBuilder().dumpAllURLs();

    // Let's see, did that generate the desired titles.json file?
    if (fs.existsSync(path.join(STATIC_ROOT, req.url))) {
      // Try now!
      return res.sendFile(path.join(STATIC_ROOT, req.url));
    } else {
      return res.status(404).send("Not yet");
    }
  }

  if (req.url.includes("/docs/")) {
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
        const built = await getOrCreateBuilder().start({
          specificFolders: [specificFolder],
        });
        const t1 = performance.now();
        // Remember, the only reason we're here in the catch-all is because
        // Express couldn't find the file as a static asset. But might
        // actually already be built because inside the Builder it might
        // have transformed the URL to something that doesn't match what
        // it's called on disk.
        // If that's the case, then `built[0].result === 'already'`.
        if (built[0].result === "already") {
          console.log(
            `Actually already built ${path.join(
              path.dirname(built[0].file),
              extraSuffix
            )} (${(t1 - t0).toFixed()}ms)`
          );
        } else {
          console.log(
            `Successfully on-the-fly built ${path.join(
              path.dirname(built[0].file),
              extraSuffix
            )} (${(t1 - t0).toFixed()}ms)`
          );
        }
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
