import React from "react";
const fs = require("fs");
const url = require("url");
const path = require("path");

// const crypto = require("crypto");

// This is necessary because the server.js is in server/dist/server.js
// and we need to reach the .env this way.
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

import yaml from "js-yaml";
import minimist from "minimist";
import { StaticRouter as Router, matchPath } from "react-router";
import sourceMapSupport from "source-map-support";
import App from "../client/src/App";
import render from "./render";

const ROUTES = [
  { path: "", exact: true },
  { path: "/:locale", exact: true },
  { path: "/:locale/docs/:slug*" },
  { path: "/docs/:slug*" },
  { path: "/search", exact: true }
];

sourceMapSupport.install();

/* Return a absolute path that is the correct URI for the website */
function mapToURI({ document }) {
  return url.parse(document.mdn_url).pathname;
}

function getRecipe({ document }) {
  // XXX this needs to get smarter!
  const recipe = yaml.safeLoad(
    fs.readFileSync("../stumptown/recipes/html-element.yaml", "utf8")
  );
  return recipe;
}

function buildHtmlAndJson({ filePath, output }) {
  const data = fs.readFileSync(filePath, "utf8");
  // const buildHash = crypto
  //   .createHash("md5")
  //   .update(data)
  //   .digest("hex");

  const jsonData = JSON.parse(data);

  const baseNameSans = path.basename(filePath).replace(/\.json/g, "");
  const options = {
    // XXX this is weird and ugly
    document: jsonData.html.elements[baseNameSans]
  };
  options.document.__recipe__ = getRecipe(jsonData);

  const uri = mapToURI({ filePath, document: options.document });

  const destination = path.join(output, uri);
  const outfileHtml = path.join(destination, "index.html");
  const outfileJson = path.join(destination, "index.json");
  // const outfileHash = path.join(destination, "index.hash");

  // let previousHash = "";
  // try {
  //   previousHash = fs.readFileSync(outfileHash, "utf8");
  // } catch (ex) {
  //   // That's fine
  // }
  // console.log("PREVIOUS HASH", [previousHash, buildHash]);

  const match = ROUTES.reduce((acc, route) => {
    return matchPath(uri, route) || acc;
  }, null);

  if (!match) {
    throw new Error(`Urecognized URL pattern ${uri}`);
  }
  const rendered = render(
    <Router context={{}} location={uri}>
      <App {...options} />
    </Router>,
    options
  );
  fs.mkdirSync(destination, { recursive: true });
  fs.writeFileSync(outfileHtml, rendered);
  fs.writeFileSync(outfileJson, JSON.stringify(options, null, 2));
  // fs.writeFileSync(outfileHash, buildHash);
  console.log(`Wrote ${outfileHtml} and ${outfileJson}`);
}

const args = process.argv.slice(2);
const argv = minimist(args, {
  boolean: ["help", "version", "verbose", "debug"],
  string: ["output"],
  default: {
    output: "../client/build"
  },
  alias: {
    debug: "d",
    help: "h",
    version: "v",
    output: "o"
  },
  unknown: param => {
    if (param.startsWith("-")) {
      console.warn("Ignored unknown option: " + param + "\n");
      return false;
    }
  }
});

if (argv["help"]) {
  console.log(
    "Usage: build [opts] path [path2 ...]\n\n" +
      "Available options:\n" +
      "  .... " +
      ""
  );
  process.exit(0);
}

const paths = argv["_"];
paths.forEach(filePath => {
  const output = argv.output;
  fs.access(filePath, fs.constants.R_OK, err => {
    if (err) {
      console.error(err.toString());
      process.exit(1);
    }
    buildHtmlAndJson({ filePath, output });
  });
});
