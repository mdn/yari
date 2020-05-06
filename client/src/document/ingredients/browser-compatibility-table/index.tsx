import React, { useCallback, useState } from "react";
import type bcd from "mdn-browser-compat-data/types";
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

interface BrowserFeature {
  browser: bcd.BrowserNames;
  feature: number;
}

function FeatureRowWithIndex({
  index,
  onToggleBrowserFeature,
  ...props
}: {
  index: number;
  onToggleBrowserFeature: (p: BrowserFeature) => void;
} & Omit<Parameters<typeof FeatureRow>[0], "onToggleBrowser">) {
  const handleToggleBrowser = useCallback(
    (browser: bcd.BrowserNames) => {
      onToggleBrowserFeature({ browser, feature: index });
    },
    [index]
  );
  return <FeatureRow {...props} onToggleBrowser={handleToggleBrowser} />;
}

const inactiveBrowserFeature = {
  browser: null,
  feature: null,
};

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

  const [
    { browser: activeBrowser, feature: activeFeature },
    setActiveBrowserFeature,
  ] = useState<BrowserFeature | typeof inactiveBrowserFeature>({
    browser: null,
    feature: null,
  });

  function toggleActiveFeatureBrowser({ browser, feature }: BrowserFeature) {
    setActiveBrowserFeature(
      activeBrowser == browser && activeFeature == feature
        ? inactiveBrowserFeature
        : { browser, feature }
    );
  }

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
            {listFeatures(data, name).map((feature, i) => {
              return (
                <FeatureRowWithIndex
                  key={i}
                  {...{ feature, browsers }}
                  index={i}
                  showNotesFor={activeFeature == i ? activeBrowser : null}
                  onToggleBrowserFeature={toggleActiveFeatureBrowser}
                />
              );
            })}
          </tbody>
        </table>
        <Legend compat={data} />
      </BrowserInfoContext.Provider>
    </BrowserCompatibilityErrorBoundary>
  );
}
