import React from "react";
import { Routes, Route } from "react-router-dom";

import { PageContentContainer } from "../ui/atoms/page-content";
import { PageNotFound } from "../page-not-found";
const App = React.lazy(() => import("./app"));
const Notes = React.lazy(() => import("./notes"));

export function Plus() {
  const pageTitle = "MDN Plus";
  React.useEffect(() => {
    document.title = pageTitle;
  }, []);
  const isServer = typeof window === "undefined";

  const routes = (
    <Routes>
      <Route
        path="/"
        element={
          <React.Suspense fallback={<p>Loading...</p>}>
            <App />
          </React.Suspense>
        }
      />
      <Route
        path="notes"
        element={
          <React.Suspense fallback={<p>Loading...</p>}>
            <Notes />
          </React.Suspense>
        }
      />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );

  return (
    <PageContentContainer extraClasses="plus">
      {!isServer && routes}
    </PageContentContainer>
  );
}
