import React from "react";

import { PageContentContainer } from "../ui/atoms/page-content";

const App = React.lazy(() => import("./app"));

export function PlusV1() {
  const pageTitle = "MDN Plus";
  React.useEffect(() => {
    document.title = pageTitle;
  }, []);
  const isServer = typeof window === "undefined";
  return (
    <div className="settings">
      <PageContentContainer extraClasses="plus">
        {!isServer && (
          <React.Suspense fallback={<p>Loading...</p>}>
            <App />
          </React.Suspense>
        )}
      </PageContentContainer>
    </div>
  );
}
