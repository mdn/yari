/**
 * The purpose of these routes is to respond with a JSON payload on
 * requests that come in to localhost:5000/api/v1/*
 *
 * You can read more about it in the docs/proxying.md document.
 */

const fs = require("fs");
const path = require("path");

const express = require("express");

const router = express();

router.get("*", (req, res) => {
  const folder = path.resolve("./fake-v1-api");
  if (!fs.existsSync(folder)) {
    throw new Error(
      `If you're going to fake v1 API requests you have to create the folder: ${folder}`
    );
  }
  if (
    Object.keys(req.query).filter((key) => key.startsWith("_whoami.")).length
  ) {
    // Build the payload based on the query string
    const payload = {
      waffle: {
        flags: {},
        switches: {},
        samples: {},
      },
    };
    for (const [key, value] of Object.entries(req.query)) {
      if (key.startsWith("_whoami.")) {
        key
          .replace("_whoami.", "")
          .split(".")
          .reduce((r, e, i, arr) => {
            return (r[e] = r[e] || (arr[i + 1] ? {} : value));
          }, payload);
      }
    }
    console.log("whoami payload:", JSON.stringify(payload, undefined, 2));
    res.json(payload);
  } else {
    const filepath = path.join(folder, `${req.url.slice(1)}.json`);

    if (fs.existsSync(filepath)) {
      const payload = fs.readFileSync(filepath);
      res.json(JSON.parse(payload));
    } else {
      console.warn(`Tried to fake ${req.url} but ${filepath} doesn't exist.`);
      res.status(404).json({ folder, filepath });
    }
  }
});

module.exports = router;
