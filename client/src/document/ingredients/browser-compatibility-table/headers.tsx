import type BCD from "@mdn/browser-compat-data/types";
import { BrowserName } from "./browser-info";
import { forwardRef } from "react";

function PlatformHeaders({
  platforms,
  browsers,
  browserInfo,
}: {
  platforms: string[];
  browsers: BCD.BrowserName[];
  browserInfo: BCD.Browsers;
}) {
  return (
    <tr className="bc-platforms">
      <td />
      {platforms.map((platform) => {
        // Get the intersection of browsers in the `browsers` array and the
        // `PLATFORM_BROWSERS[platform]`.
        const browsersInPlatform = browsers.filter(
          (browser) => browserInfo[browser].type === platform
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

function BrowserHeaders({ browsers }: { browsers: BCD.BrowserName[] }) {
  return (
    <tr className="bc-browsers">
      <td />
      {browsers.map((browser) => {
        return (
          <th key={browser} className={`bc-browser bc-browser-${browser}`}>
            <div className={`bc-head-txt-label bc-head-icon-${browser}`}>
              <BrowserName id={browser} />
            </div>
            <div
              className={`bc-head-icon-symbol icon icon-${browserToIconName(
                browser
              )}`}
            ></div>
          </th>
        );
      })}
    </tr>
  );
}

export function browserToIconName(browser: string) {
  const browserStart = browser.split("_")[0];
  return browserStart === "firefox" ? "simple-firefox" : browserStart;
}

export const Headers = forwardRef<
  HTMLTableSectionElement,
  {
    platforms: string[];
    browsers: BCD.BrowserName[];
    browserInfo: BCD.Browsers;
  }
>(function Headers({ platforms, browsers, browserInfo }, ref) {
  return (
    <thead ref={ref}>
      <PlatformHeaders
        platforms={platforms}
        browsers={browsers}
        browserInfo={browserInfo}
      />
      <BrowserHeaders browsers={browsers} />
    </thead>
  );
});
