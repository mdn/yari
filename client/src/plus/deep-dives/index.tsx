import React from "react";
import { useParams } from "react-router-dom";

import { Loading } from "../../ui/atoms/loading";
import { PageContentContainer } from "../../ui/atoms/page-content";

const Article = React.lazy(() => import("./article"));

interface DeepDivesProps {
  pageTitle?: string;
  locale?: string;
}

export function DeepDives(props: DeepDivesProps) {
  React.useEffect(() => {
    document.title = props.pageTitle || "MDN Plus Deep Dives";
  }, [props.pageTitle]);
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
