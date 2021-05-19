import React from "react";

import { PageContentContainer } from "../ui/atoms/page-content";

const App = React.lazy(() => import("./app"));

export function Plus() {
  const pageTitle = "MDN++";
  React.useEffect(() => {
    document.title = pageTitle;
  }, []);
  const isServer = typeof window === "undefined";
  return (
    <div className="settings">
      <PageContentContainer extraClasses="plus">
        {/* The reason for displaying this <h1> here
          is to avoid an unnecessary "flicker".
          component here is loaded SSR and is immediately present.
          Only the "guts" below is lazy loaded. By having the header already
          present the page feels less flickery at a very affordable cost of
          allowing this to be part of the main JS bundle.
       */}
        <h1 className="slab-highlight">{pageTitle}</h1>
        {!isServer && (
          <React.Suspense fallback={<p>Loading...</p>}>
            <App />
          </React.Suspense>
        )}
      </PageContentContainer>
    </div>
  );
}
