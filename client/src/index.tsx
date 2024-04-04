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

let attemptedFallback = false;
window.addEventListener("error", async (error) => {
  const root = document.querySelector("#root");
  if (
    !attemptedFallback &&
    root &&
    // only fall back if react gave up and unmounted, leaving an empty page
    root.innerHTML.trim() === ""
  ) {
    attemptedFallback = true;
    try {
      const res = await fetch(window.location.pathname, {
        cache: "force-cache",
      });
      const page = await res.text();
      const parser = new DOMParser();
      const fallbackRoot = parser
        .parseFromString(page, "text/html")
        .querySelector("#root");
      if (fallbackRoot) {
        root.innerHTML = fallbackRoot.innerHTML;
        console.warn(
          "Fell back to static HTML page due to unhandled error,",
          "please report an issue on GitHub:",
          generateGithubIssueLink(error.error)
        );
      } else {
        throw new Error("no root");
      }
    } catch (fallbackError) {
      console.warn(
        "Failed falling back to static HTML page:",
        fallbackError,
        "please report an issue on GitHub:",
        generateGithubIssueLink(error.error, fallbackError)
      );
    }
  }
  // Unlike other events, the error event is canceled by returning true from the handler instead of returning false.
  // https://developer.mozilla.org/en-US/docs/Web/API/Window/error_event#usage_notes
  return false;
});

function generateGithubIssueLink(error: Error, fallbackError?: any) {
  try {
    const params = new URLSearchParams();
    params.append("title", `Unhandled error: ${error.message}`);
    params.append("labels", "🐛 bug");
    params.append(
      "body",
      `Location: ${"`"}${window.location}${"`"}

Error:
${"```"}
${error.name}: ${error.message}
${"```"}${
        error.stack
          ? `

Stack:
${"```"}
${error.stack}
${"```"}`
          : ""
      }${
        fallbackError instanceof Error
          ? `

Error when attempting to fallback to HTML:
${"```"}
${fallbackError.name}: ${fallbackError.message}
${"```"}`
          : ""
      }`
    );
    return `https://github.com/mdn/yari/issues/new?${params}`;
  } catch {
    return "https://github.com/mdn/yari/issues/new";
  }
}

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
          <UIProvider>
            <Router>
              <PlacementProvider>
                <App {...appData} />
              </PlacementProvider>
            </Router>
          </UIProvider>
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
