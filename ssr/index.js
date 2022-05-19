import path from "path";

import React from "react";
import { StaticRouter } from "react-router-dom/server.js";

import { App } from "../client/src/app.tsx";
import render from "./render.js";

// This is necessary because the ssr.js is in dist/ssr.js
// and we need to reach the .env this way.

import dotenv from "dotenv";

import { fileURLToPath } from "url";
const dirname = fileURLToPath(new URL(".", import.meta.url));

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
