import React from "react";
import { Routes, Route } from "react-router-dom";

import { useIsServer } from "../hooks";
import { Loading } from "../ui/atoms/loading";
import { MainContentContainer } from "../ui/atoms/page-content";
import { MDN_PLUS_TITLE } from "../constants";
import { ArticleActionsContainer } from "../ui/organisms/article-actions-container";
import { DocParent } from "../../../libs/types/document";
import PageNotFound from "../page-not-found";

import "./index.scss";

const AiHelp = React.lazy(() => import("./ai-help"));
const Collections = React.lazy(() => import("./collections"));
const OfferOverview = React.lazy(() => import("./offer-overview"));
const PlusDocs = React.lazy(() => import("./plus-docs"));
const Settings = React.lazy(() => import("../settings"));
const Updates = React.lazy(() => import("./updates"));

interface LayoutProps {
  withoutContainer?: boolean;
  withSSR?: boolean;
  parents?: DocParent[];
  children: React.ReactNode;
}

function Layout({
  withoutContainer = false,
  withSSR = false,
  parents = undefined,
  children,
}: LayoutProps) {
  const loading = <Loading message={`Loading…`} minHeight={800} />;
  const isServer = useIsServer();
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
export function Plus({ pageTitle, ...props }: { pageTitle?: string }) {
  React.useEffect(() => {
    document.title = pageTitle || MDN_PLUS_TITLE;
  }, [pageTitle]);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Layout withSSR={true}>
            <OfferOverview />
          </Layout>
        }
      />
      <Route
        path="ai-help"
        element={
          <Layout>
            <AiHelp />
          </Layout>
        }
      />
      <Route
        path="collections/*"
        element={
          <Layout>
            <Collections />
          </Layout>
        }
      />
      <Route
        path="updates/*"
        element={
          <Layout>
            <Updates />
          </Layout>
        }
      />
      <Route
        path="/settings"
        element={
          <Layout>
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
