import path from "node:path";
import { fileURLToPath } from "node:url";

import * as dotenv from "dotenv";
import React from "react";
import { StaticRouter } from "react-router-dom/server";

import { App, AppProps } from "../client/src/app";
import render from "./render";

const dirname = fileURLToPath(new URL(".", import.meta.url));

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
