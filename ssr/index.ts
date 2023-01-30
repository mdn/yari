import path from "node:path";

import dotenv from "dotenv";
import React from "react";
import { StaticRouter } from "react-router-dom/server";

import { App, AppProps } from "../client/src/app";
import render from "./render";

const dirname = __dirname;

// This is necessary because the ssr.js is in dist/ssr.js
// and we need to reach the .env this way.
dotenv.config({
  path: path.join(dirname, "..", process.env.ENV_FILE || ".env"),
});

export function renderHTML(url: string, context: AppProps) {
  return render(
    React.createElement(
      StaticRouter,
      { location: url },
      React.createElement(App, context)
    ),
    context
  );
}
