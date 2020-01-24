const fs = require("fs");
const path = require("path");

const express = require("express");
const openEditor = require("open-editor");

const { runBuild } = require("content/scripts/build");
const {
  DEFAULT_ROOT,
  DEFAULT_DESTINATION
} = require("content/scripts/constants.js");

const app = express();

const STATIC_ROOT = path.join(__dirname, "../client/build");

// The client/build directory is won't exist at the very very first time
// you start the server after a fresh git clone.
if (!fs.existsSync(STATIC_ROOT)) {
  fs.mkdirSync(STATIC_ROOT);
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

app.get("/_open", (req, res) => {
  const filepath = req.query.filepath;
  if (!filepath) {
    throw new Error("No .filepath in the request query");
  }
  openEditor([filepath]);
  res.status(200).send(`Tried to open ${filepath} in ${process.env.EDITOR}`);
});

// Catch-all
app.get("/*", async (req, res) => {
  if (req.url.startsWith("/static")) {
    res.status(404).send("Page not found");
  } else if (req.url.endsWith("/titles.json")) {
    await runBuild(
      {
        root: DEFAULT_ROOT,
        destination: DEFAULT_DESTINATION,
        generateAllTitles: true,
        noSitemaps: true,
        specificFolders: [],
        buildJsonOnly: true,
        locales: [],
        notLocales: [],
        slugsearch: [],
        noProgressbar: true
      },
      console
    );
    // Let's see, did that generate the desired titles.json file?
    if (fs.existsSync(path.join(STATIC_ROOT, req.url))) {
      // Try now!
      res.sendFile(path.join(STATIC_ROOT, req.url));
    } else {
      res.status(404).send("Not yet");
    }
  } else if (req.url.endsWith(".json") && req.url.includes("/docs/")) {
    const specificFolder = path.dirname(
      path.join(DEFAULT_ROOT, req.url.slice(1).replace("/docs", ""))
    );
    // Check that it even makes sense!
    if (
      fs.existsSync(specificFolder) &&
      fs.statSync(specificFolder).isDirectory()
    ) {
      const built = await runBuild(
        {
          root: DEFAULT_ROOT,
          destination: DEFAULT_DESTINATION,
          specificFolders: [specificFolder],
          buildJsonOnly: true,
          locales: [],
          notLocales: [],
          slugsearch: [],
          noProgressbar: true,
          noSitemaps: true
        },
        console
      );
      res.sendFile(built[0].jsonFile);
    } else {
      res.status(404).send("Page not found. Couldn't be generated.");
    }
  } else {
    res.sendFile(path.join(STATIC_ROOT, "/index.html"));
  }
});

app.listen(5000, () => console.log("Listening on port 5000"));
