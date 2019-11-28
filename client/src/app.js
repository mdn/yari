import React from "react";
import { Router, Link } from "@reach/router";

import { Homepage } from "./homepage";
import { Document } from "./document";
import { NoMatch } from "./routing";
import { SearchWidget } from "./search/search";
import { SearchIndexProvider } from "./search/search-index";
import { SearchPage } from "./search/search-page";

export function App(appProps) {
  return (
    <SearchIndexProvider>
      <Router primary={false}>
        <Header default />
      </Router>
      <section className="section">
        <Router>
          <Homepage path="/" />
          <SearchPage path="/:locale/search/:query" />
          <Document {...appProps} path="/:locale/docs/*" />
          <NoMatch default />
        </Router>
      </section>
    </SearchIndexProvider>
  );
}

function Header({ location }) {
  return (
    <header>
      <h1>
        <Link to="/">MDN Web Docs</Link>
      </h1>
      <SearchWidget pathname={location.pathname} />
    </header>
  );
}
