import React from "react";
import { useParams } from "react-router-dom";

import { Loading } from "../ui/atoms/loading";
import { PageContentContainer } from "../ui/atoms/page-content";

interface DeepDiveProps {
  pageTitle?: string;
  locale?: string;
}

export function DeepDive(props: DeepDiveProps) {
  React.useEffect(() => {
    document.title = props.pageTitle || "MDN Plus Deep Dives";
  }, [props.pageTitle]);
  const { "*": slug } = useParams();

  const isServer = typeof window === "undefined";

  const Article =
    slug === "planning-for-browser-support"
      ? React.lazy(() => import("./planning-for-browser-support"))
      : slug === "your-browser-support-toolkit"
      ? React.lazy(() => import("./your-browser-support-toolkit"))
      : slug
      ? React.lazy(() => import("./not-found"))
      : null;

  return (
    <PageContentContainer extraClasses="plus deep-dives">
      {!isServer && Article && (
        <React.Suspense
          fallback={<Loading message="Loading deep dive…" minHeight={600} />}
        >
          <Article slug={slug} />
        </React.Suspense>
      )}
    </PageContentContainer>
  );
}
