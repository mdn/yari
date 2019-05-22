import React from "react";
const fs = require("fs");
const util = require("util");

// This is necessary because the server.js is in server/dist/server.js
// and we need to reach the .env this way.
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

import express from "express";
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

const readFile = fileName => util.promisify(fs.readFile)(fileName, "utf8");

sourceMapSupport.install();

const app = express();

app.get("/api/v0/documents/:locale/:slug*", async (req, res) => {
  //   console.log(Object.keys(req));
  console.warn(req.params);
  const { locale, slug } = req.params;
  let data;
  try {
    data = await readFile("../stumptown/packaged/html/elements/video.json");
  } catch (ex) {
    return res.status(404).send("Can't find file");
    // throw new Error(ex);
  }

  const jsonData = JSON.parse(data);
  res.status(200).json({ document: jsonData.html.elements.video });
  return; // needed??
  //   res.status(500).send(`Bad proxying`);
});
app.get("/", (req, res) => {
  //   console.log(Object.keys(req));
  console.log("IN HERE");
  res.status(200).send("Hello kind world!");
  return;
  //   res.status(500).send(`Bad proxying`);
});

// Server-side rendering React
app.get("/*", (req, res) => {
  console.log(req.url);

  const secure = req.get("x-forwarded-proto") === "https";
  const baseAbsoluteUrl = `${secure ? "https" : "http"}://${req.get("host")}`;
  const options = {};
  options.absoluteUrl = `${baseAbsoluteUrl}${req.url}`;

  const match = ROUTES.reduce((acc, route) => {
    return matchPath(req.url, route) || acc;
  }, null);
  console.log("match:", match);

  if (!match) {
    // Doesn't match anything in the React App!
    return res.status(404).send(
      render(
        <Router context={{}} location={req.url}>
          <App />
        </Router>,
        options
      )
    );
  }

  if (match.url === "/" && match.isExact) {
    res.status(200).send(
      render(
        <Router context={{}} location={req.url}>
          <App />
        </Router>,
        options
      )
    );
  } else {
    // If it doesn't depend on any API data, cache it aggressively
    // res.set("Cache-Control", "public, max-age=86400"); // 1 day
    // console.log(`Server Rendering ${absoluteUrl}`);
    res.status(200).send(
      render(
        <Router context={{}} location={req.url}>
          <App />
        </Router>,
        options
      )
    );
  }
});

app.listen(5000, () => console.log("Listening on port 5000"));
