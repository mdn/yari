import React from "react";
import { Platforms } from "./platforms";
import { Browsers } from "./browsers";
import { Rows } from "./rows";
import { Legend } from "./legend";
import "./bcd.scss";
import { BrowserCompatibilityErrorBoundary } from "./error-boundary";

const BROWSERS = {
  desktop: ["chrome", "edge", "firefox", "ie", "opera", "safari"],
  mobile: [
    "webview_android",
    "chrome_android",
    "firefox_android",
    "opera_android",
    "safari_ios",
    "samsunginternet_android",
  ],
  server: ["nodejs"],
  "webextensions-desktop": ["chrome", "edge", "firefox", "opera"],
  "webextensions-mobile": ["firefox_android"],
};

class BrowserCompatibilityTableContent extends React.Component<any, any> {
  state = {
    currentNoteId: null,
    hasDeprecation: false,
    hasExperimental: false,
    hasNonStandard: false,
    hasAlternative: false,
    hasFlag: false,
    hasPrefix: false,
    hasNotes: false,
    legendSet: false,
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
        ...BROWSERS["webextensions-mobile"],
      ];
      platforms = ["webextensions-desktop", "webextensions-mobile"];
    }
    return [platforms, displayBrowsers];
  }

  onNotesClick = (noteId) => {
    this.setState({
      currentNoteId: noteId === this.state.currentNoteId ? null : noteId,
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
        legendSet: true,
      });
    }
  };

  render() {
    const { data } = this.props;
    const category = data.query.split(".").shift();
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
        <table key="bc-table" className="bc-table bc-table-web">
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

export const BrowserCompatibilityTable = (props) => {
  return (
    <BrowserCompatibilityErrorBoundary>
      {props.data && props.data.title && (
        <h2 id={props.data.id}>{props.data.title}</h2>
      )}
      <BrowserCompatibilityTableContent {...props} />
    </BrowserCompatibilityErrorBoundary>
  );
};
