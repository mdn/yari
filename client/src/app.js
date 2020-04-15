import React, { Suspense, lazy } from "react";
import { Router, Link } from "@reach/router";

import { Homepage } from "./homepage";
import { Document } from "./document";
import { NoMatch } from "./routing";
import { SearchWidget } from "./search";
const AllFlaws = lazy(() => import("./flaws"));

export function App(appProps) {
  const router = (
    <Router>
      <Homepage path="/" />
      {process.env.NODE_ENV === "development" && (
        <AllFlaws {...appProps} path="/:locale/flaws" />
      )}
      <Document {...appProps} path="/:locale/docs/*" />
      <NoMatch default />
    </Router>
  );
  const isServer = typeof window === "undefined";
  return (
    <div>
      <Router primary={false}>
        <Header default />
      </Router>
      <section className="section">
        {/* This might look a bit odd but it's actually quite handy.
        This way, when rendering client-side, we wrap all the routes in
        <Suspense> but in server-side rendering that goes away.
         */}
        {isServer ? (
          router
        ) : (
          <Suspense fallback={<div>Loading...</div>}>{router}</Suspense>
        )}
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
