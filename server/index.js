const path = require("path");

const express = require("express");

const app = express();

// XXX Check that that folder exists and has stuff!
const STATIC_ROOT = path.join(__dirname, "../client/dist");

app.use(express.static(STATIC_ROOT));

// Catch-all
app.get("/*", (req, res) => {
  if (req.url.startsWith("/static") || req.url.endsWith(".json")) {
    res.status(404).send("Page not found");
  } else {
    res.sendFile(path.join(STATIC_ROOT, "/index.html"));
  }
});

app.listen(5000, () => console.log("Listening on port 5000"));
