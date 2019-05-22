import React from "react";
const fs = require("fs");

// This is necessary because the server.js is in server/dist/server.js
// and we need to reach the .env this way.
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

const minimist = require("minimist");
import { StaticRouter as Router, matchPath } from "react-router";
import sourceMapSupport from "source-map-support";
import App from "../client/src/App";
import render from "./render";

const ROUTES = [
  { path: "", exact: true },
  { path: "/:locale", exact: true },
  { path: "/:locale/docs/:slug*" },
  { path: "/search", exact: true }
];

sourceMapSupport.install();

function rsplit(s, sep, maxsplit) {
  var split = s.split(sep);
  return maxsplit
    ? [split.slice(0, -maxsplit).join(sep)].concat(split.slice(-maxsplit))
    : split;
}
/* Return a absolute path that is the correct URI for the website */
function mapToURI({ filePath, document }) {
  // XXX read from `document['mdn-url']`??
  // For example, the file in stumptown is called
  // "<stumptown build>/html/elements/video.json"
  // but on MDN it's called "Web/HTML/Element/video"

  const locale = "en-US";
  // XXX gross but will work for now
  let slug = filePath
    .replace(/\.json$/g, "")
    .split("/")
    .slice(-3)
    .join("/");
  if (slug.startsWith("html/elements")) {
    // These we know how to deal with
    const split = slug.split("/");
    return `/${locale}/docs/Web/HTML/Element/${split.pop()}`;
  }
  console.warn(`Guesswork with converting ${slug} to a web URI`);
  return `/${locale}/docs/${slug}`;
}

function buildHtmlAndJson({ filePath, output }) {
  const data = fs.readFileSync(filePath, "utf-8");
  const jsonData = JSON.parse(data);

  const baseNameSans = path.basename(filePath).replace(/\.json/g, "");
  const options = {
    // XXX this is weird and ugly
    document: jsonData.html.elements[baseNameSans]
  };
  const url = mapToURI({ filePath, document: options.document });
  const match = ROUTES.reduce((acc, route) => {
    return matchPath(url, route) || acc;
  }, null);

  if (!match) {
    throw new Error(`Urecognized URL pattern ${url}`);
  }

  const rendered = render(
    <Router context={{}} location={url}>
      <App {...options} />
    </Router>,
    options
  );
  const destination = path.join(output, url);
  const outfileHtml = path.join(destination, "index.html");
  const outfileJson = path.join(destination, "index.json");

  fs.mkdirSync(destination, { recursive: true });
  fs.writeFileSync(outfileHtml, rendered);
  fs.writeFileSync(outfileJson, JSON.stringify(options, null, 2));
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
