import { fileURLToPath } from "node:url";

import dotenv from "dotenv";
import React from "react";
import { StaticRouter } from "react-router-dom/server";

import { App } from "../client/src/app.tsx";
import render from "./render.ts";

// This is necessary because the ssr.js is in dist/ssr.js
// and we need to reach the .env this way.
dotenv.config({
  path: fileURLToPath(
    new URL("../" + (process.env.ENV_FILE || ".env"), import.meta.url)
  ),
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
