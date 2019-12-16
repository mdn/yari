const path = require("path");

const express = require("express");
const openEditor = require("open-editor");

const app = express();

// XXX Check that that folder exists and has stuff!
const STATIC_ROOT = path.join(__dirname, "../client/build");

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

// app.get("/", (req, res) => {
//   res.status(200).send("Hello kind world!");
// });

app.get("/_open", (req, res) => {
  const filepath = req.query.filepath;
  if (!filepath) {
    throw new Error("No .filepath in the request query");
  }
  openEditor([filepath]);
  res.status(200).send(`Tried to open ${filepath} in ${process.env.EDITOR}`);
});

// Catch-all
app.get("/*", (req, res) => {
  if (req.url.startsWith("/static") || req.url.endsWith(".json")) {
    res.status(404).send("Page not found");
  } else {
    res.sendFile(path.join(STATIC_ROOT, "/index.html"));
  }
});

app.listen(5000, () => console.log("Listening on port 5000"));
