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
import { NoMatch } from "./routing";
import { Banner } from "./banners";

const AllFlaws = lazy(() => import("./flaws"));
const DocumentEdit = lazy(() => import("./document/forms/edit"));
const DocumentCreate = lazy(() => import("./document/forms/create"));
const DocumentManage = lazy(() => import("./document/forms/manage"));

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

function StandardLayout({ children }) {
  return <Layout pageType="standard-page">{children}</Layout>;
}
function DocumentLayout({ children }) {
  return <Layout pageType="reference-page">{children}</Layout>;
}

export function App(appProps) {
  const routes = (
    <Routes>
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
                <DocumentLayout>
                  <Document {...appProps} />
                </DocumentLayout>
              }
            />
          </Routes>
        }
      />
      <Route
        path="*"
        element={
          <StandardLayout>
            <NoMatch />
          </StandardLayout>
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
