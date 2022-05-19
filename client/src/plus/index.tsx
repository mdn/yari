// @ts-expect-error ts-migrate(1259) FIXME: Module '"/Users/claas/github/mdn/yari/node_modules... Remove this comment to see the full error message
import React from "react";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module 'react-router-dom'. Did you mea... Remove this comment to see the full error message
import { Routes, Route } from "react-router-dom";

import { useIsServer } from "../hooks";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module '../ui/atoms/loading'. Did you ... Remove this comment to see the full error message
import { Loading } from "../ui/atoms/loading";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module '../ui/atoms/page-content'. Did... Remove this comment to see the full error message
import { PageContentContainer } from "../ui/atoms/page-content";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module '../page-not-found'. Did you me... Remove this comment to see the full error message
import { PageNotFound } from "../page-not-found";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module './notifications'. Did you mean... Remove this comment to see the full error message
import Notifications from "./notifications";
import { MDN_PLUS_TITLE } from "../constants";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module '../offline-settings'. Did you ... Remove this comment to see the full error message
import { OfflineSettings } from "../offline-settings";

// @ts-expect-error ts-migrate(1323) FIXME: Dynamic imports are only supported when the '--mod... Remove this comment to see the full error message
const OfferOverview = React.lazy(() => import("./offer-overview"));
// @ts-expect-error ts-migrate(1323) FIXME: Dynamic imports are only supported when the '--mod... Remove this comment to see the full error message
const Collections = React.lazy(() => import("./collections"));
// @ts-expect-error ts-migrate(1323) FIXME: Dynamic imports are only supported when the '--mod... Remove this comment to see the full error message
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
