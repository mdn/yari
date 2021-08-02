import React from "react";

import { Loading } from "../ui/atoms/loading";
import { PageContentContainer } from "../ui/atoms/page-content";

const App = React.lazy(() => import("./app"));

export function PlusV1() {
  const pageTitle = "MDN Plus";
  React.useEffect(() => {
    document.title = pageTitle;
  }, []);
  const isServer = typeof window === "undefined";
  const loading = <Loading message={`Loading ${pageTitle}…`} minHeight={800} />;
  return (
    <div className="settings">
      <PageContentContainer extraClasses="plus">
        {isServer ? (
          loading
        ) : (
          <React.Suspense fallback={loading}>
            <App />
          </React.Suspense>
        )}
      </PageContentContainer>
    </div>
  );
}
