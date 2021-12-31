import type bcd from "@mdn/browser-compat-data/types";
import { BrowserName } from "./browser-info";

export const PLATFORM_BROWSERS: { [key: string]: bcd.BrowserNames[] } = {
  desktop: ["chrome", "edge", "firefox", "ie", "opera", "safari"],
  mobile: [
    "webview_android",
    "chrome_android",
    "firefox_android",
    "opera_android",
    "safari_ios",
    "samsunginternet_android",
  ],
  server: ["deno", "nodejs"],
  "webextensions-desktop": ["chrome", "edge", "firefox", "opera", "safari"],
  "webextensions-mobile": ["firefox_android", "safari_ios"],
};

function PlatformHeaders({ platforms, browsers }) {
  return (
    <tr className="bc-platforms">
      <td />
      {platforms.map((platform) => {
        // Get the intersection of browsers in the `browsers` array and the
        // `PLATFORM_BROWSERS[platform]`.
        const browsersInPlatform = PLATFORM_BROWSERS[platform].filter(
          (browser) => browsers.includes(browser)
        );
        const browserCount = Object.keys(browsersInPlatform).length;
        const platformId = platform.replace("webextensions-", "");
        return (
          <th
            key={platform}
            className={`bc-platform-${platformId}`}
            colSpan={browserCount}
            title={platform}
          >
            <span>{platform}</span>
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
      {browsers.map((browser) => (
        <th key={browser} className={`bc-browser-${browser}`}>
          <span className={`bc-head-txt-label bc-head-icon-${browser}`}>
            <BrowserName id={browser} />
          </span>
        </th>
      ))}
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
