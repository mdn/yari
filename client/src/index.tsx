// @ts-expect-error ts-migrate(1259) FIXME: Module '"/Users/claas/github/mdn/yari/node_modules... Remove this comment to see the full error message
import React from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module 'react-router-dom'. Did you mea... Remove this comment to see the full error message
import { BrowserRouter as Router } from "react-router-dom";

import { App } from "./app";
import { GAProvider } from "./ga-context";
import { UserDataProvider } from "./user-context";
import { UIProvider } from "./ui-context";

// import * as serviceWorker from './serviceWorker';

const container = document.getElementById("root");
if (!container) {
  throw new Error("missing root element");
}

// The SSR rendering will put a `<script type="application/json">` into the HTML.
// If it's there, great, if it's not there, this'll be `undefined` the
// components will know to fetch it with XHR.
const hydrationElement = document.getElementById("hydration");
const appData = hydrationElement
  ? JSON.parse(hydrationElement.textContent!)
  : {};

const app = (
  <React.StrictMode>
    <GAProvider>
      <UserDataProvider>
        <UIProvider>
          <Router>
            <App {...appData} />
          </Router>
        </UIProvider>
      </UserDataProvider>
    </GAProvider>
  </React.StrictMode>
);

if (container.firstElementChild) {
  if (window.origin !== "https://translate.googleusercontent.com") {
    hydrateRoot(container, app);
  }
} else {
  createRoot(container).render(app);
}

// Initialize mdnWorker if there's a service worker already.
if (navigator?.serviceWorker?.controller && !window.mdnWorker) {
  // @ts-expect-error ts-migrate(1323) FIXME: Dynamic imports are only supported when the '--mod... Remove this comment to see the full error message
  import("./offline-settings/mdn-worker");
}
