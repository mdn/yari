import React from "react";
import { Routes, Route } from "react-router-dom";

import { Loading } from "../ui/atoms/loading";
import { PageContentContainer } from "../ui/atoms/page-content";
import { PageNotFound } from "../page-not-found";
const App = React.lazy(() => import("./app"));

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
          <React.Suspense fallback={loading}>
            <App />
          </React.Suspense>
        }
      />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );

  return (
    <PageContentContainer extraClasses="plus">
      {isServer ? loading : routes}
    </PageContentContainer>
  );
}
