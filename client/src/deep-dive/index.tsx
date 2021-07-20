import React from "react";
import { useParams } from "react-router-dom";

import { PageContentContainer } from "../ui/atoms/page-content";

const PlanningForBrowserSupport = React.lazy(
  () => import("./planning-for-browser-support")
);
const YourBrowserSupportToolkit = React.lazy(
  () => import("./your-browser-support-toolkit")
);

export function DeepDive() {
  const pageTitle = "MDN Plus Deep Dives";
  React.useEffect(() => {
    document.title = pageTitle;
  }, []);
  const { "*": slug, locale } = useParams();
  const isServer = typeof window === "undefined";
  console.log(slug, locale);
  return (
    <PageContentContainer extraClasses="plus deep-dives">
      {!isServer && (
        <React.Suspense fallback={<p>Loading...</p>}>
          {slug === "planning-for-browser-support" && (
            <PlanningForBrowserSupport />
          )}
          {slug === "your-browser-support-toolkit" && (
            <YourBrowserSupportToolkit />
          )}
        </React.Suspense>
      )}
    </PageContentContainer>
  );
}
