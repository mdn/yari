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
  server: ["nodejs"],
  "webextensions-desktop": ["chrome", "edge", "firefox", "opera", "safari"],
  "webextensions-mobile": ["firefox_android"],
};

function PlatformHeaders({ platforms }) {
  return (
    <tr className="bc-platforms">
      <td />
      {platforms.map((platform) => {
        const platformCount = Object.keys(PLATFORM_BROWSERS[platform]).length;
        const platformId = platform.replace("webextensions-", "");
        return (
          <th
            key={platform}
            className={`bc-platform-${platformId}`}
            colSpan={platformCount}
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
      <PlatformHeaders platforms={platforms} />
      <BrowserHeaders browsers={browsers} />
    </thead>
  );
}
