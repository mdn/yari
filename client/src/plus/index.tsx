import React from "react";
import { Routes, Route } from "react-router-dom";

import { Loading } from "../ui/atoms/loading";
import { PageContentContainer } from "../ui/atoms/page-content";
import { PageNotFound } from "../page-not-found";
import Notifications from "./notifications";

const OfferOverview = React.lazy(() => import("./offer-overview"));
const Collections = React.lazy(() => import("./collections"));
const FeatureHighlight = React.lazy(() => import("./feature-highlight"));
const StaticPlusPage = React.lazy(() => import("./static-plus-page"));

export function Plus({ pageTitle, ...props }: { pageTitle?: string }) {
  const defaultPageTitle = "MDN Plus";
  React.useEffect(() => {
    document.title = pageTitle || defaultPageTitle;
  }, [pageTitle]);

  const isServer = typeof window === "undefined";
  const loading = (
    <Loading
      message={`Loading ${pageTitle || defaultPageTitle}…`}
      minHeight={800}
    />
  );

  const routes = (
    <Routes>
      <Route
        path="/"
        element={
          <React.Suspense fallback={loading}>
            <OfferOverview />
          </React.Suspense>
        }
      />
      <Route
        path="collections/*"
        element={
          <React.Suspense fallback={loading}>
            <div className="bookmarks girdle">
              <Collections />
            </div>
          </React.Suspense>
        }
      />
      <Route
        path="notifications/*"
        element={
          <React.Suspense fallback={loading}>
            <div className="notifications girdle">
              <Notifications />
            </div>
          </React.Suspense>
        }
      />
      <Route
        path="features/:feature"
        element={
          <React.Suspense fallback={loading}>
            <FeatureHighlight {...props} />
          </React.Suspense>
        }
      />
      <Route
        path="faq"
        element={
          <React.Suspense fallback={loading}>
            <StaticPlusPage {...{ ...props, slug: "faq" }} />
          </React.Suspense>
        }
      />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );

  return (
    <PageContentContainer extraClasses="fullwidth">
      {isServer ? loading : routes}
    </PageContentContainer>
  );
}
