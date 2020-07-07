import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";

import { Homepage } from "./homepage";
import { Document } from "./document";
import Header from "./header";
import { NoMatch } from "./routing";
const AllFlaws = lazy(() => import("./flaws"));
const DocumentEdit = lazy(() => import("./document/forms/edit"));
const DocumentCreate = lazy(() => import("./document/forms/create"));

function Layout({ children }) {
  return (
    <>
      <Header />
      <section className="section">{children}</section>
    </>
  );
}

export function App(appProps) {
  const routes = (
    <Routes>
      <Route
        path="/"
        element={
          <Layout>
            <Homepage />
          </Layout>
        }
      />
      <Route
        path="/:locale/*"
        element={
          <Layout>
            <Routes>
              {process.env.NODE_ENV === "development" && (
                <>
                  <Route path="/_flaws" element={<AllFlaws />} />
                  <Route path="/_create/*" element={<DocumentCreate />} />
                  <Route path="/_edit/*" element={<DocumentEdit />} />
                </>
              )}
              <Route path="/docs/*" element={<Document {...appProps} />} />
            </Routes>
          </Layout>
        }
      />
      <Route
        path="*"
        element={
          <Layout>
            <NoMatch />
          </Layout>
        }
      />
    </Routes>
  );
  const isServer = typeof window === "undefined";
  /* This might look a bit odd but it's actually quite handy.
   * This way, when rendering client-side, we wrap all the routes in
   * <Suspense> but in server-side rendering that goes away.
   */
  return isServer ? (
    routes
  ) : (
    <Suspense fallback={<div>Loading...</div>}>{routes}</Suspense>
  );
}
