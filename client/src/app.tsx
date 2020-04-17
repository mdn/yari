// @ts-nocheck
import React from "react";
import { Router, Link } from "@reach/router";

import { Homepage } from "./homepage";
import { Document } from "./document";
import { NoMatch } from "./routing";
import { SearchWidget } from "./search";

export function App(appProps) {
  return (
    <div>
      <Router primary={false}>
        <Header default />
      </Router>
      <section className="section">
        <Router>
          <Homepage path="/" />
          <Document {...appProps} path="/:locale/docs/*" />
          <NoMatch default />
        </Router>
      </section>
    </div>
  );
}

function Header({ location }: any) {
  return (
    <header>
      <h1>
        <Link to="/">MDN Web Docs</Link>
      </h1>
      <SearchWidget pathname={location.pathname} />
    </header>
  );
}
