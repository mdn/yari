import React from "react";

import { Loading } from "../../../ui/atoms/loading";
import { PageContentContainer } from "../../../ui/atoms/page-content";

const App = React.lazy(() => import("./app"));

export function DeepDivesHomepage() {
  const pageTitle = "MDN Plus Deep Dives";
  React.useEffect(() => {
    document.title = pageTitle;
  }, []);
  const isServer = typeof window === "undefined";
  const loading = <Loading message={`Loading ${pageTitle}…`} minHeight={800} />;
  return (
    <PageContentContainer extraClasses="plus deep-dives">
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
