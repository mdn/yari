const path = require("path");
const express = require("express");

const STUMPTOWN_CONTENT_ROOT =
  process.env.STUMPTOWN_CONTENT_ROOT || path.join(__dirname, "..", "stumptown");
const buildPage = require(path.join(
  STUMPTOWN_CONTENT_ROOT,
  "scripts",
  "build-json",
  "build-page-json"
));

const app = express();
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

const PORT = parseInt(process.env.BUILD_JSON_SERVER_PORT || "5555");

app.get("/", (req, res) => {
  res.send("You're supposed to POST!\n");
});

app.post("/", async (req, res) => {
  let filePath = req.body.path;
  if (!filePath) {
    return res
      .status(400)
      .json({ error: "Expected 'application/json' posted with key 'path'" });
  }
  let error = null;
  let built = null;
  try {
    console.log(`Calling buildPageJSON(${filePath})`);
    built = await buildPage.buildPageJSON(filePath);
  } catch (ex) {
    // throw ex;
    console.warn(`Exception from buildPage.buildPageJSON: ${ex.toString()}`);
    return res.status(500).json({ error: ex.toString(), built });
  }

  // XXX This is never true!
  if (error) {
    return res.status(400).json({ error, built });
  }
  console.log(`Built: ${JSON.stringify(built)}`);
  res.status(201).json({ built, error });
});

app.listen(PORT, () => {
  console.log(`build-json server listening on port ${PORT}!`);
});
