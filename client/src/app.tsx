import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";

// we include our base SASS here to ensure it is loaded
// and applied before any component specific style
import "./app.scss";

import { CRUD_MODE } from "./constants";
import { Homepage } from "./homepage";
import { Document } from "./document";
import { Footer } from "./ui/organisms/footer";
import { Header } from "./ui/organisms/header";
import { NoMatch } from "./no-match";
import { Banner } from "./banners";

const AllFlaws = lazy(() => import("./flaws"));
const DocumentEdit = lazy(() => import("./document/forms/edit"));
const DocumentCreate = lazy(() => import("./document/forms/create"));

const isServer = typeof window === "undefined";

function Layout({ pageType, children }) {
  return (
    <>
      <div className={`page-wrapper ${pageType}`}>
        <Header />
        {children}
        <Footer />
        {!isServer && <Banner />}
      </div>
      {/* Shown on mobile when main navigation is expanded to provide a clear distinction between the foreground menu and the page content */}
      <div className="page-overlay hidden"></div>
    </>
  );
}

export function App(appProps) {
  const routes = (
    <Routes>
      {/*
        Note, this can only happen in local development.
        In production, all traffic at `/` is redirected to at least
        having a locale. So it'll be `/en-US` (for example) by the
        time it hits any React code.
       */}
      <Route
        path="/"
        element={
          <Layout pageType="home-page">
            <Homepage />
          </Layout>
        }
      />
      <Route
        path="/:locale/*"
        element={
          <Routes>
            {CRUD_MODE && (
              <>
                <Route path="/_flaws" element={<AllFlaws />} />
                <Route path="/_create/*" element={<DocumentCreate />} />
                <Route path="/_edit/*" element={<DocumentEdit />} />
              </>
            )}
            <Route
              path="/"
              element={
                <Layout pageType="home-page">
                  <Homepage />
                </Layout>
              }
            />
            <Route
              path="/docs/*"
              element={
                // It's important to do this so if the server-side render says
                // this render is for a page not found.
                // Otherwise, the document route will take over and start to try to
                // download the `./index.json` thinking that was all that was missing.
                appProps.pageNotFound ? (
                  <Layout pageType="error-page">
                    <NoMatch />
                  </Layout>
                ) : (
                  <Layout pageType="reference-page">
                    <Document {...appProps} />
                  </Layout>
                )
              }
            />
            <Route
              path="*"
              element={
                <Layout pageType="error-page">
                  <NoMatch />
                </Layout>
              }
            />
          </Routes>
        }
      />
    </Routes>
  );
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
