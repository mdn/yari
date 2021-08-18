import React from "react";
import { Routes, Route } from "react-router-dom";

import { Loading } from "../ui/atoms/loading";
import { PageContentContainer } from "../ui/atoms/page-content";
import { PageNotFound } from "../page-not-found";
const App = React.lazy(() => import("./app"));
// XXX temporary hack while we still have this plus-v1 dupe.
const Bookmarks = React.lazy(() => import("../plus/bookmarks"));

export function PlusV1({ pageTitle }: { pageTitle?: string }) {
  const defaultPageTitle = "MDN Plus";
  React.useEffect(() => {
    document.title = pageTitle || defaultPageTitle;
  }, [pageTitle]);

  const isServer = typeof window === "undefined";
  const loading = (
    <Loading
      message={`Loading ${pageTitle || defaultPageTitle}…`}
      minHeight={800}
    />
  );

  const routes = (
    <Routes>
      <Route
        path="/"
        element={
          isServer ? (
            loading
          ) : (
            <React.Suspense fallback={loading}>
              <App />
            </React.Suspense>
          )
        }
      />
      <Route
        path="/bookmarks"
        element={
          isServer ? (
            <div className="bookmarks">{loading}</div>
          ) : (
            <React.Suspense fallback={loading}>
              <div className="bookmarks">
                <Bookmarks />
              </div>
            </React.Suspense>
          )
        }
      />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );

  return (
    <PageContentContainer extraClasses="plus">{routes}</PageContentContainer>
  );
}
