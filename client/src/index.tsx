import React from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";

import { App } from "./app";
import { GAProvider } from "./ga-context";
import { UserDataProvider } from "./user-context";
import { UIProvider } from "./ui-context";
import { GleanProvider } from "./telemetry/glean-context";
import { PlacementProvider } from "./placement-context";

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
    <GleanProvider>
      <GAProvider>
        <UserDataProvider>
          <PlacementProvider>
            <UIProvider>
              <Router>
                <App {...appData} />
              </Router>
            </UIProvider>
          </PlacementProvider>
        </UserDataProvider>
      </GAProvider>
    </GleanProvider>
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
  import("./settings/mdn-worker").then(({ getMDNWorker }) => getMDNWorker());
}
