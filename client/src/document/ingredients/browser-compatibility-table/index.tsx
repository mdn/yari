import React, { useCallback } from "react";
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

function FeatureRowWithCallback({
  index,
  onToggleBrowserFeature,
  ...props
}: {
  index: number;
  onToggleBrowserFeature: (feature: number, browser: bcd.BrowserNames) => void;
} & Omit<React.ComponentProps<typeof FeatureRow>, "onToggleBrowser">) {
  const handleToggleBrowser = useCallback(
    (browser: bcd.BrowserNames) => {
      onToggleBrowserFeature(index, browser);
    },
    [index, onToggleBrowserFeature]
  );
  return <FeatureRow {...props} onToggleBrowser={handleToggleBrowser} />;
}

class FeatureListAccordion extends React.Component<
  {
    features: ReturnType<typeof listFeatures>;
    browsers: bcd.BrowserNames[];
  },
  { activeRow: null | number; activeBrowser: null | bcd.BrowserNames }
> {
  state = { activeRow: null, activeBrowser: null };

  toggleActiveBrowserFeature = (row, browser) => {
    this.setState(
      this.state.activeBrowser === browser && this.state.activeRow === row
        ? { activeRow: null, activeBrowser: null }
        : { activeRow: row, activeBrowser: browser }
    );
  };

  render() {
    const { features, browsers } = this.props;
    const { activeRow, activeBrowser } = this.state;
    return features.map((feature, i) => {
      return (
        <FeatureRowWithCallback
          key={i}
          {...{ feature, browsers }}
          index={i}
          showNotesFor={activeRow === i ? activeBrowser : null}
          onToggleBrowserFeature={this.toggleActiveBrowserFeature}
        />
      );
    });
  }
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
            <FeatureListAccordion
              browsers={browsers}
              features={listFeatures(data, name)}
            />
          </tbody>
        </table>
        <Legend compat={data} />
      </BrowserInfoContext.Provider>
    </BrowserCompatibilityErrorBoundary>
  );
}
