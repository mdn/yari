import * as React from "react";

import "./index.scss";

export function Homepage() {
  return (
    <main role="main">
      <div className="hero">
        <div className="hero-content">
          <h1>Resources for developers, by developers.</h1>
          <ul>
            <li>
              <a href="/en-US/docs/Web">Web Technologies</a>
            </li>
            <li>
              <a href="/en-US/docs/Learn">Learn Web Development</a>
            </li>
            <li>
              <a href="/en-US/docs/Tools">Developer Tools</a>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
