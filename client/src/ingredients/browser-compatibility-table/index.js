import React, { Component, useState, useEffect } from "react";
import { Platforms } from "./platforms";
import { Browsers } from "./browsers";
import { Rows } from "./rows";
import { Legend } from "./legend";
import "./bcd.scss";

const BROWSERS = {
  desktop: ["chrome", "edge", "firefox", "ie", "opera", "safari"],
  mobile: [
    "webview_android",
    "chrome_android",
    "firefox_android",
    "opera_android",
    "safari_ios",
    "samsunginternet_android"
  ],
  server: ["nodejs"],
  "webextensions-desktop": ["chrome", "edge", "firefox", "opera"],
  "webextensions-mobile": ["firefox_android"]
};

class BrowserCompatibilityTableContent extends Component {
  state = {
    currentNoteId: null,
    hasDeprecation: false,
    hasExperimental: false,
    hasNonStandard: false,
    hasFlag: false,
    hasPrefix: false,
    hasNotes: false,
    legendSet: false
  };

  gatherPlatformsAndBrowsers(category) {
    let platforms = ["desktop", "mobile"];
    let displayBrowsers = [...BROWSERS["desktop"], ...BROWSERS["mobile"]];
    if (category === "javascript") {
      displayBrowsers.push(...BROWSERS["server"]);
      platforms.push("server");
    }
    if (category === "webextensions") {
      displayBrowsers = [
        ...BROWSERS["webextensions-desktop"],
        ...BROWSERS["webextensions-mobile"]
      ];
      platforms = ["webextensions-desktop", "webextensions-mobile"];
    }
    return [platforms, displayBrowsers];
  }

  onNotesClick = noteId => {
    this.setState({
      currentNoteId: noteId === this.state.currentNoteId ? null : noteId
    });
  };

  setLegendIcons = (
    hasDeprecation,
    hasExperimental,
    hasNonStandard,
    hasFlag,
    hasPrefix,
    hasAlternative,
    hasNotes
  ) => {
    if (!this.state.legendSet) {
      this.setState({
        hasDeprecation,
        hasExperimental,
        hasNonStandard,
        hasFlag,
        hasPrefix,
        hasAlternative,
        hasNotes,
        legendSet: true
      });
    }
  };

  render() {
    const { data, category = "html" } = this.props;
    if (!data || !Object.keys(data).length) {
      throw new Error(
        "BrowserCompatibilityTable component called with empty data"
      );
    }

    const [platforms, displayBrowsers] = this.gatherPlatformsAndBrowsers(
      category
    );
    return (
      <>
        <a
          className="bc-github-link external external-icon"
          href="https://github.com/mdn/browser-compat-data"
          rel="noopener"
        >
          Update compatibility data on GitHub
        </a>
        <table className="bc-table bc-table-web">
          <thead>
            <Platforms platforms={platforms} browsers={BROWSERS} />
            <Browsers displayBrowsers={displayBrowsers} />
          </thead>
          <tbody>
            <Rows
              compatibilityData={data}
              displayBrowsers={displayBrowsers}
              currentNoteId={this.state.currentNoteId}
              onNotesClick={this.onNotesClick}
              setLegendIcons={this.setLegendIcons}
            />
          </tbody>
        </table>
        <Legend
          hasDeprecation={this.state.hasDeprecation}
          hasExperimental={this.state.hasExperimental}
          hasNonStandard={this.state.hasNonStandard}
          hasFlag={this.state.hasFlag}
          hasPrefix={this.state.hasPrefix}
          hasAlternative={this.state.hasAlternative}
          hasNotes={this.state.hasNotes}
        />
      </>
    );
  }
}

export function BrowserCompatibilityTable({ data }) {
  const { uri } = data;
  const [fullData, setFullData] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  useEffect(() => {
    let dismounted = false;
    let url = document.location.pathname;

    // Hopefully this hack won't be necessary once we sort out our
    // CloudFront redirect stuff.
    url = url.replace(/index\.html$/, "");

    if (!url.endsWith("/")) url += "/";
    url += uri;
    fetch(url)
      .then(r => {
        if (!r.ok) {
          return setFetchError(r);
        }
        return r.json();
      })
      .then(data => {
        if (!dismounted) {
          setFullData(data);
        }
      })
      .catch(err => {
        setFetchError(err);
      });
    return () => {
      dismounted = true;
    };
  }, [uri]);
  return (
    <>
      {data.title && <h2 id={data.id}>{data.title}</h2>}
      {!fullData && fetchError && <FetchError error={fetchError} />}
      {/* Animate this? */}
      {!fullData && !fetchError && (
        <p>Loading browser compatibility table...</p>
      )}
      {fullData && <BrowserCompatibilityTableContent data={fullData} />}
    </>
  );
}

function FetchError({ error }) {
  let isResponse = false;
  try {
    isResponse = error instanceof window.Response;
  } catch (err) {
    // Old browsers don't support '... instanceof window.Response'
  }
  if (isResponse) {
    return (
      <p className="bcd-fetch-error">
        Unable to load the JSON from the server.
        <br />
        <small>
          <code>
            {error.status} on {error.url}
          </code>
        </small>
      </p>
    );
  }
  return (
    <p className="bcd-fetch-error">
      Problem loading JSON from the server
      <br />
      <small>
        <code>{error.toString()}</code>
      </small>
      .
    </p>
  );
}
