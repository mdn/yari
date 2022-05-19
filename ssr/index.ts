// @ts-expect-error ts-migrate(1259) FIXME: Module '"path"' can only be default-imported using... Remove this comment to see the full error message
import path from "path";

// @ts-expect-error ts-migrate(1259) FIXME: Module '"/Users/claas/github/mdn/yari/node_modules... Remove this comment to see the full error message
import React from "react";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module 'react-router-dom/server'. Did ... Remove this comment to see the full error message
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
      { location: url },
      React.createElement(App, context)
    ),
    context
  );
}
