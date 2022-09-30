import React from "react";
import { Routes, Route, useLocation, useParams } from "react-router-dom";

import { useIsServer } from "../hooks";
import { Loading } from "../ui/atoms/loading";
import { MainContentContainer } from "../ui/atoms/page-content";
import { PageNotFound } from "../page-not-found";
import Notifications from "./notifications";
import { MDN_PLUS_TITLE } from "../constants";
import { Settings } from "../settings";
import PlusDocs from "./plus-docs";
import { ArticleActionsContainer } from "../ui/organisms/article-actions-container";
import { DocParent } from "../../../libs/types/document";

const OfferOverview = React.lazy(() => import("./offer-overview"));
const Collections = React.lazy(() => import("./collections"));

export function Plus({ pageTitle, ...props }: { pageTitle?: string }) {
  React.useEffect(() => {
    document.title = pageTitle || MDN_PLUS_TITLE;
  }, [pageTitle]);

  const { locale = "en-US" } = useParams();
  const { pathname } = useLocation();

  const isServer = useIsServer();
  const loading = (
    <Loading
      message={`Loading ${pageTitle || MDN_PLUS_TITLE}…`}
      minHeight={800}
    />
  );

  function Layout({
    withoutContainer = false,
    withSSR = false,
    parents = undefined,
    children,
  }: {
    withoutContainer?: boolean;
    withSSR?: boolean;
    parents?: DocParent[];
    children: React.ReactNode;
  }) {
    const inner = (
      <>
        {isServer ? (
          withSSR ? (
            children
          ) : (
            loading
          )
        ) : (
          <React.Suspense fallback={loading}>{children}</React.Suspense>
        )}
      </>
    );

    return withoutContainer ? (
      inner
    ) : (
      <>
        {parents && <ArticleActionsContainer parents={parents} />}
        <MainContentContainer>{inner}</MainContentContainer>
      </>
    );
  }

  const parents = [{ uri: `/${locale}/plus`, title: MDN_PLUS_TITLE }];

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
          <Layout
            parents={[...parents, { uri: pathname, title: "Collections" }]}
          >
            <Collections />
          </Layout>
        }
      />
      <Route
        path="notifications/*"
        element={
          <Layout
            parents={[...parents, { uri: pathname, title: "Notifications" }]}
          >
            <div className="notifications girdle">
              <Notifications />
            </div>
          </Layout>
        }
      />
      <Route
        path="/settings"
        element={
          <Layout
            parents={[...parents, { uri: pathname, title: "My Settings" }]}
          >
            <Settings {...props} />
          </Layout>
        }
      />
      <Route
        path="docs/*"
        element={
          <Layout withoutContainer withSSR={true}>
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
