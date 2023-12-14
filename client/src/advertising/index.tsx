import React from "react";
import { Routes, Route } from "react-router-dom";

import { useIsServer } from "../hooks";
import { Loading } from "../ui/atoms/loading";
import { MainContentContainer } from "../ui/atoms/page-content";
import { ArticleActionsContainer } from "../ui/organisms/article-actions-container";
import { DocParent } from "../../../libs/types/document";

import { AdvertiseWithUs } from "./with_us";

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

export default function Advertising({
  pageTitle,
  ...props
}: {
  pageTitle?: string;
}) {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Layout>
            <AdvertiseWithUs />
          </Layout>
        }
      />
    </Routes>
  );
}
