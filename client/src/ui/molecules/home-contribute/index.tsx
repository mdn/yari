import * as React from "react";

import "./index.scss";

export function Contribute() {
  return (
    <div className="contribute">
      <h2>Help improve MDN Web Docs</h2>
      <p>
        All parts of MDN (docs and the site itself) are created by an open
        community of developers. Please join us! Pick one of these ways to help:
      </p>

      <ul>
        <li>
          <a href="/en-US/docs/MDN/Getting_started">Getting started</a>
        </li>
        <li>
          <a href="/en-US/docs/MDN/Contribute">Contributing to MDN content</a>
        </li>
        <li>
          <a href="https://github.com/mdn/yari#readme">
            Contributing to the MDN codebase
          </a>
        </li>
        <li>
          <a href="https://github.com/mdn/browser-compat-data">
            Updating browser compatibility data
          </a>
        </li>
      </ul>
    </div>
  );
}
