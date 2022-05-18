import { browsers as browserData } from "@mdn/browser-compat-data";
import { BrowserName } from "./browser-info";

function PlatformHeaders({ platforms, browsers }) {
  return (
    <tr className="bc-platforms">
      <td />
      {platforms.map((platform) => {
        // Get the intersection of browsers in the `browsers` array and the
        // `PLATFORM_BROWSERS[platform]`.
        const browsersInPlatform = browsers.filter(
          (browser) => browserData[browser].type === platform
        );
        const browserCount = browsersInPlatform.length;
        return (
          <th
            key={platform}
            className={`bc-platform bc-platform-${platform}`}
            colSpan={browserCount}
            title={platform}
          >
            <span className={`icon icon-${platform}`}></span>
            <span className="visually-hidden">{platform}</span>
          </th>
        );
      })}
    </tr>
  );
}

function BrowserHeaders({ browsers }: { browsers }) {
  return (
    <tr className="bc-browsers">
      <td />
      {browsers.map((browser) => {
        const browserStart = browser.split("_")[0];
        const browserIcon =
          browserStart === "firefox" ? "simple-firefox" : browserStart;
        return (
          <th key={browser} className={`bc-browser bc-browser-${browser}`}>
            <div className={`bc-head-txt-label bc-head-icon-${browser}`}>
              <BrowserName id={browser} />
            </div>
            <div
              className={`bc-head-icon-symbol icon icon-${browserIcon}`}
            ></div>
          </th>
        );
      })}
    </tr>
  );
}

export function Headers({ platforms, browsers }) {
  return (
    <thead>
      <PlatformHeaders platforms={platforms} browsers={browsers} />
      <BrowserHeaders browsers={browsers} />
    </thead>
  );
}
