import React from "react";
import { useParams } from "react-router-dom";

import { PageContentContainer } from "../ui/atoms/page-content";

export function DeepDive() {
  const pageTitle = "MDN Plus Deep Dives";
  React.useEffect(() => {
    document.title = pageTitle;
  }, []);
  const { "*": slug } = useParams();
  const isServer = typeof window === "undefined";

  let Article;

  if (slug === "planning-for-browser-support") {
    Article = React.lazy(() => import("./planning-for-browser-support"));
  } else if (slug === "your-browser-support-toolkit") {
    Article = React.lazy(() => import("./your-browser-support-toolkit"));
  }

  return (
    <PageContentContainer extraClasses="plus deep-dives">
      {!isServer && (
        <React.Suspense fallback={<p>Loading...</p>}>
          <Article />
        </React.Suspense>
      )}
    </PageContentContainer>
  );
}
