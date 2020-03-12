import React, { Suspense, lazy } from "react";
import { Router, Link } from "@reach/router";

import { Homepage } from "./homepage";
import { Document } from "./document";
import { NoMatch } from "./routing";
import { SearchWidget } from "./search";
const EditDocument = lazy(() => import("./edit-document.js"));

export function App(appProps) {
  return (
    <div>
      <Router primary={false}>
        <Header default />
      </Router>
      <section className="section">
        <Suspense fallback={<div>Loading...</div>}>
          <Router>
            <Homepage path="/" />

            <EditDocument {...appProps} path="/:locale/edit/*" />

            <Document {...appProps} path="/:locale/docs/*" />
            <NoMatch default />
          </Router>
        </Suspense>
      </section>
    </div>
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
