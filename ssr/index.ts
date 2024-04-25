import React from "react";
import { StaticRouter } from "react-router-dom/server";

import { App } from "../client/src/app";
import render from "./render";

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
