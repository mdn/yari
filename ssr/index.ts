import React from "react";
import { StaticRouter } from "react-router-dom/server";

import { App } from "../client/src/app";
import render from "./render";
import { HydrationData } from "../libs/types/hydration";

export function renderHTML(context: HydrationData) {
  return render(
    React.createElement(
      StaticRouter,
      { location: context.url },
      React.createElement(App, context)
    ),
    context.url,
    context
  );
}
