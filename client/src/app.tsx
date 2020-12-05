import React from "react";
import { Routes, Route } from "react-router-dom";

// we include our base SASS here to ensure it is loaded
// and applied before any component specific style
import "./app.scss";

import { CRUD_MODE } from "./constants";
import { Homepage } from "./homepage";
import { Document } from "./document";
import { A11yNav } from "./ui/molecules/a11y-nav";
import { Footer } from "./ui/organisms/footer";
import { Header } from "./ui/organisms/header";
import { PageNotFound } from "./page-not-found";
import { Banner } from "./banners";

const AllFlaws = React.lazy(() => import("./flaws"));
const DocumentEdit = React.lazy(() => import("./document/forms/edit"));
const DocumentCreate = React.lazy(() => import("./document/forms/create"));
const DocumentManage = React.lazy(() => import("./document/forms/manage"));

const isServer = typeof window === "undefined";

function Layout({ pageType, children }) {
  return (
    <>
      <A11yNav />
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

function StandardLayout({ children }) {
  return <Layout pageType="standard-page">{children}</Layout>;
}
function DocumentLayout({ children }) {
  return <Layout pageType="reference-page">{children}</Layout>;
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
          <Layout pageType="standard-page">
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
                <Route
                  path="/_flaws"
                  element={
                    <StandardLayout>
                      <AllFlaws />
                    </StandardLayout>
                  }
                />
                <Route
                  path="/_create/*"
                  element={
                    <StandardLayout>
                      <DocumentCreate />
                    </StandardLayout>
                  }
                />
                <Route
                  path="/_edit/*"
                  element={
                    <StandardLayout>
                      <DocumentEdit />
                    </StandardLayout>
                  }
                />
                <Route
                  path="/_manage/*"
                  element={
                    <StandardLayout>
                      <DocumentManage />
                    </StandardLayout>
                  }
                />
                {/*
                This route exclusively exists for development on the <PageNotFound>
                component itself.
                Because it's impossible to trigger a 404 when using the React dev
                server, the one on localhost:3000, you can use this endpoint
                to simulate it.
                 */}
                <Route
                  path="/_404/*"
                  element={
                    <StandardLayout>
                      <PageNotFound />
                    </StandardLayout>
                  }
                />
              </>
            )}
            <Route
              path="/"
              element={
                <StandardLayout>
                  <Homepage />
                </StandardLayout>
              }
            />
            <Route
              path="/docs/*"
              element={
                // It's important to do this so the server-side renderer says
                // this render is for a page not found.
                // Otherwise, the document route will take over and start to try to
                // download the `./index.json` thinking that was all that was missing.
                appProps.pageNotFound ? (
                  <StandardLayout>
                    <PageNotFound />
                  </StandardLayout>
                ) : (
                  <DocumentLayout>
                    <Document {...appProps} />
                  </DocumentLayout>
                )
              }
            />
            <Route
              path="*"
              element={
                <StandardLayout>
                  <PageNotFound />
                </StandardLayout>
              }
            />
          </Routes>
        }
      />
    </Routes>
  );
  /* This might look a bit odd but it's actually quite handy.
   * This way, when rendering client-side, we wrap all the routes in
   * <React.Suspense> but in server-side rendering that goes away.
   */
  return isServer ? (
    routes
  ) : (
    <React.Suspense fallback={<div>Loading...</div>}>{routes}</React.Suspense>
  );
}
