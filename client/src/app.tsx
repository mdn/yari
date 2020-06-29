import React, { Suspense, lazy } from "react";
import { Routes, Route, Link } from "react-router-dom";

import { Homepage } from "./homepage";
import { Document } from "./document";
import { NoMatch } from "./routing";
const SearchNavigateWidget = lazy(() => import("./search"));
const AllFlaws = lazy(() => import("./flaws"));
const DocumentEdit = lazy(() => import("./document/forms/edit"));
const DocumentCreate = lazy(() => import("./document/forms/create"));

const isServer = typeof window === "undefined";

export function App(appProps) {
  const routes = (
    <Routes>
      <Route path="/" element={<Homepage />} />
      {process.env.NODE_ENV === "development" && (
        <>
          <Route path="/:locale/_flaws" element={<AllFlaws />} />
          <Route path="/:locale/_create/*" element={<DocumentCreate />} />
          <Route path="/:locale/_edit/*" element={<DocumentEdit />} />
        </>
      )}
      <Route path="/:locale/docs/*" element={<Document {...appProps} />} />
      <Route path="*" element={<NoMatch />} />
    </Routes>
  );
  return (
    <div>
      <Header />

      <section className="section">
        {/* This might look a bit odd but it's actually quite handy.
        This way, when rendering client-side, we wrap all the routes in
        <Suspense> but in server-side rendering that goes away.
         */}
        {isServer ? (
          routes
        ) : (
          <Suspense fallback={<div>Loading...</div>}>{routes}</Suspense>
        )}
      </section>
    </div>
  );
}

function Header() {
  return (
    <header>
      <h1>
        <Link to="/">MDN Web Docs</Link>
      </h1>
      {!isServer && (
        <Suspense fallback={<div>Loading...</div>}>
          <SearchNavigateWidget />
        </Suspense>
      )}
    </header>
  );
}
