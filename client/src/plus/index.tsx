import React from "react";

import { Loading } from "../ui/atoms/loading";
import { PageContentContainer } from "../ui/atoms/page-content";

const App = React.lazy(() =>
  import("./app").then((module) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(module as any);
      }, 30000);
    });
  })
);

export function Plus() {
  const pageTitle = "MDN Plus";
  React.useEffect(() => {
    document.title = pageTitle;
  }, []);
  const isServer = typeof window === "undefined";
  const loading = <Loading message={`Loading ${pageTitle}…`} minHeight={800} />;
  return (
    <PageContentContainer extraClasses="plus">
      {isServer ? (
        loading
      ) : (
        <React.Suspense fallback={loading}>
          <App />
        </React.Suspense>
      )}
    </PageContentContainer>
  );
}
