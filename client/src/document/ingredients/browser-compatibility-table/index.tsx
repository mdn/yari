import React from "react";
import type bcd from "mdn-browser-compat-data/types";
import { AccordionProvider } from "./accordion";
import { BrowserInfoContext } from "./browser-info";
import { BrowserCompatibilityErrorBoundary } from "./error-boundary";
import { FeatureRow } from "./feature-row";
import { PLATFORM_BROWSERS, Headers } from "./headers";
import { Legend } from "./legend";
import { listFeatures } from "./utils";

import "./bcd.scss";

function gatherPlatformsAndBrowsers(category): [string[], bcd.BrowserNames[]] {
  let platforms = ["desktop", "mobile"];
  if (category === "javascript") {
    platforms.push("server");
  } else if (category === "webextensions") {
    platforms = ["webextensions-desktop", "webextensions-mobile"];
  }
  return [
    platforms,
    platforms.map((platform) => PLATFORM_BROWSERS[platform] || []).flat(),
  ];
}

export function BrowserCompatibilityTable({
  id,
  title,
  query,
  data,
  browsers: browserInfo,
}: {
  id: string;
  title: string;
  query: string;
  data: bcd.Identifier;
  browsers: bcd.Browsers;
}) {
  if (!data || !Object.keys(data).length) {
    throw new Error(
      "BrowserCompatibilityTable component called with empty data"
    );
  }

  const breadcrumbs = query.split(".");
  const category = breadcrumbs[0];
  const name = breadcrumbs[breadcrumbs.length - 1];

  const [platforms, browsers] = gatherPlatformsAndBrowsers(category);

  return (
    <BrowserCompatibilityErrorBoundary>
      <BrowserInfoContext.Provider value={browserInfo}>
        {title && <h2 id={id}>{title}</h2>}
        <a
          className="bc-github-link external external-icon"
          href="https://github.com/mdn/browser-compat-data"
          rel="noopener"
        >
          Update compatibility data on GitHub
        </a>
        <table key="bc-table" className="bc-table bc-table-web">
          <Headers {...{ platforms, browsers }} />
          <tbody>
            <AccordionProvider>
              {listFeatures(data, name).map((feature, i) => (
                <FeatureRow key={i} index={i} {...{ feature, browsers }} />
              ))}
            </AccordionProvider>
          </tbody>
        </table>
        <Legend compat={data} />
      </BrowserInfoContext.Provider>
    </BrowserCompatibilityErrorBoundary>
  );
}
