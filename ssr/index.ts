import path from "node:path";
import { fileURLToPath } from "node:url";

import dotenv from "dotenv";
import React from "react";
import { StaticRouter } from "react-router-dom/server";

import { App } from "../client/src/app.tsx";
import render from "./render.ts";

const dirname = fileURLToPath(new URL(".", import.meta.url));

// This is necessary because the ssr.js is in dist/ssr.js
// and we need to reach the .env this way.
dotenv.config({
  path: path.join(dirname, "..", process.env.ENV_FILE || ".env"),
});

export function renderHTML(url, context) {
  return render(
    React.createElement(
      StaticRouter,
      { location: url },
      React.createElement(App, context)
    ),
    context
  );
}
