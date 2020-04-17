import React from "react";
import BrowserName from "./utils/browser-name";

export function Browsers({ displayBrowsers }) {
  return (
    <tr className="bc-browsers">
      <td />
      {displayBrowsers.map((displayBrowser) => (
        <th key={displayBrowser} className={`bc-browser-${displayBrowser}`}>
          <span className={`bc-head-txt-label bc-head-icon-${displayBrowser}`}>
            <BrowserName browserNameKey={displayBrowser} />
          </span>
        </th>
      ))}
    </tr>
  );
}
