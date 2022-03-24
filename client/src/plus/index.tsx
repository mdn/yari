import React from "react";
import { Routes, Route } from "react-router-dom";

import { Loading } from "../ui/atoms/loading";
import { PageContentContainer } from "../ui/atoms/page-content";
import { PageNotFound } from "../page-not-found";
import Notifications from "./notifications";
import { MDN_PLUS_TITLE } from "../constants";

const OfferOverview = React.lazy(() => import("./offer-overview"));
const Collections = React.lazy(() => import("./collections"));
const PlusDocs = React.lazy(() => import("./plus-docs"));

export function Plus({ pageTitle, ...props }: { pageTitle?: string }) {
  React.useEffect(() => {
    document.title = pageTitle || MDN_PLUS_TITLE;
  }, [pageTitle]);

  const isServer = typeof window === "undefined";
  const loading = (
    <Loading
      message={`Loading ${pageTitle || MDN_PLUS_TITLE}…`}
      minHeight={800}
    />
  );

  function Layout({ children }) {
    return (
      <PageContentContainer extraClasses="fullwidth">
        {isServer ? (
          loading
        ) : (
          <React.Suspense fallback={loading}>{children}</React.Suspense>
        )}
      </PageContentContainer>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Layout>
            <OfferOverview />
          </Layout>
        }
      />
      <Route
        path="collections/*"
        element={
          <Layout>
            <div className="bookmarks girdle">
              <Collections />
            </div>
          </Layout>
        }
      />
      <Route
        path="notifications/*"
        element={
          <Layout>
            <div className="notifications girdle">
              <Notifications />
            </div>
          </Layout>
        }
      />
      <Route
        path="docs/*"
        element={
          <Layout>
            <PlusDocs {...props} />
          </Layout>
        }
      />
      <Route
        path="*"
        element={
          <Layout>
            <PageNotFound />
          </Layout>
        }
      />
    </Routes>
  );
}
