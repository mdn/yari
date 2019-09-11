import path from "path";

import express from "express";
import sourceMapSupport from "source-map-support";

sourceMapSupport.install();

const app = express();

// XXX Check that that folder exists and has stuff!
const STATIC_ROOT = path.join(__dirname, "../client/build");

app.use(
  express.static(STATIC_ROOT, {
    // https://expressjs.com/en/4x/api.html#express.static
  })
);

// app.get("/", (req, res) => {
//   res.status(200).send("Hello kind world!");
// });

// Catch-all
app.get("/*", (req, res) => {
  if (req.url.startsWith("/static") || req.url.endsWith(".json")) {
    res.status(404).send("Page not found");
  } else {
    res.sendFile(path.join(STATIC_ROOT, "/index.html"));
  }
});

app.listen(5000, () => console.log("Listening on port 5000"));
