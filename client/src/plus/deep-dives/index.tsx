import React from "react";
import { useParams } from "react-router-dom";

import { Loading } from "../../ui/atoms/loading";
import { PageContentContainer } from "../../ui/atoms/page-content";

const Article = React.lazy(() => import("./article"));

export function DeepDives({ pageTitle }: { pageTitle?: string }) {
  const defaultTitle = "MDN Plus Deep Dives";
  React.useEffect(() => {
    document.title = pageTitle || defaultTitle;
  }, [pageTitle]);
  const { "*": slug } = useParams();

  const isServer = typeof window === "undefined";

  return (
    <PageContentContainer extraClasses="plus deep-dives">
      {!isServer && (
        <React.Suspense
          fallback={<Loading message="Loading deep dive…" minHeight={600} />}
        >
          <Article slug={slug} />
        </React.Suspense>
      )}
    </PageContentContainer>
  );
}
