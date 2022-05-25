import React from "react";
import { Routes, Route } from "react-router-dom";

import { useIsServer } from "../hooks";
import { Loading } from "../ui/atoms/loading";
import { PageContentContainer } from "../ui/atoms/page-content";
import { PageNotFound } from "../page-not-found";
import Notifications from "./notifications";
import { MDN_PLUS_TITLE } from "../constants";
import { OfflineSettings } from "../offline-settings";

const OfferOverview = React.lazy(() => import("./offer-overview"));
const Collections = React.lazy(() => import("./collections"));
const PlusDocs = React.lazy(() => import("./plus-docs"));

export function Plus({ pageTitle, ...props }: { pageTitle?: string }) {
  React.useEffect(() => {
    document.title = pageTitle || MDN_PLUS_TITLE;
  }, [pageTitle]);

  const isServer = useIsServer();
  const loading = (
    <Loading
      message={`Loading ${pageTitle || MDN_PLUS_TITLE}…`}
      minHeight={800}
    />
  );

  function Layout({ withoutContainer = false, children }) {
    const inner = (
      <>
        {isServer ? (
          loading
        ) : (
          <React.Suspense fallback={loading}>{children}</React.Suspense>
        )}
      </>
    );

    return withoutContainer ? (
      inner
    ) : (
      <PageContentContainer extraClasses="fullwidth">
        {inner}
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
        path="/offline"
        element={
          <Layout>
            <OfflineSettings {...props} />
          </Layout>
        }
      />
      <Route
        path="docs/*"
        element={
          <Layout withoutContainer>
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
