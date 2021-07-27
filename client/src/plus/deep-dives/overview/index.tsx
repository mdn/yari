import React from "react";

import { Loading } from "../../../ui/atoms/loading";
import { PageContentContainer } from "../../../ui/atoms/page-content";

const App = React.lazy(() => import("./app"));

export function Overview({ pageTitle }: { pageTitle?: string }) {
  const defaultTitle = "Modern CSS in the Real World";
  React.useEffect(() => {
    document.title = pageTitle || defaultTitle;
  }, [pageTitle]);
  const isServer = typeof window === "undefined";
  return (
    <PageContentContainer extraClasses="plus">
      {!isServer && (
        <React.Suspense
          fallback={
            <Loading
              message={`Loading ${pageTitle || defaultTitle}…`}
              minHeight={600}
            />
          }
        >
          <App />
        </React.Suspense>
      )}
    </PageContentContainer>
  );
}
