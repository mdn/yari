import React from "react";

import { Loading } from "../ui/atoms/loading";
import { PageContentContainer } from "../ui/atoms/page-content";

const App = React.lazy(() => import("./app"));

export function Plus() {
  const pageTitle = "MDN Plus";
  React.useEffect(() => {
    document.title = pageTitle;
  }, []);
  const isServer = typeof window === "undefined";
  return (
    <PageContentContainer extraClasses="plus">
      {!isServer && (
        <React.Suspense
          fallback={<Loading message="Loading MDN Plus…" minHeight={600} />}
        >
          <App />
        </React.Suspense>
      )}
    </PageContentContainer>
  );
}
