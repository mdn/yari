import React from "react";
import { Router, Link } from "@reach/router";

import { Homepage } from "./homepage";
import { Document } from "./document";
import { NoMatch } from "./routing";

export function App(appProps) {
  return (
    <div>
      <Router primary={false}>
        <Header default />
      </Router>
      <section className="section">
        <Router>
          <Homepage path="/" />
          <Document {...appProps} path="/docs/*" />
          <NoMatch default />
        </Router>
      </section>
    </div>
  );
}

function Header(props) {
  return (
    <header>
      <h1>
        <Link to="/">MDN Web Docs</Link>
      </h1>
    </header>
  );
}
