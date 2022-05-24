import path from "path";

import React from "react";
import { StaticRouter } from "react-router-dom/server";

import { App } from "../client/src/app";
import render from "./render";

const dirname = __dirname;

// This is necessary because the ssr.js is in dist/ssr.js
// and we need to reach the .env this way.
const dotenv = require("dotenv");
dotenv.config({
  path: path.join(dirname, "..", process.env.ENV_FILE || ".env"),
});

export function renderHTML(url, context) {
  return render(
    React.createElement(
      StaticRouter,
      { location: url, context },
      React.createElement(App, context)
    ),
    context
  );
}
