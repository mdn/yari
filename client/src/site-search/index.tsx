import React from "react";
import { useSearchParams } from "react-router-dom";

import { PageContentContainer } from "../ui/atoms/page-content";
import LoadingPlaceholder from "../ui/atoms/loading-placeholder";

import { useGA } from "../ga-context";
import "./index.scss";

const SearchResults = React.lazy(() => import("./search-results"));

export function SiteSearch() {
  const isServer = typeof window === "undefined";
  const ga = useGA();
  const [searchParams] = useSearchParams();

  const query = searchParams.get("q");
  const page = searchParams.get("page");
  React.useEffect(() => {
    if (query) {
      let title = `Search results for "${query}"`;
      if (page && page !== "1") {
        title += `, (page ${page})`;
      }
      document.title = title;
    } else {
      document.title = "No search results for your query.";
    }

    document.title += " - MDN Web Docs";
  }, [query, page]);

  const mountCounter = React.useRef(0);
  React.useEffect(() => {
    if (ga) {
      if (mountCounter.current > 0) {
        // 'dimension19' means it's a client-side navigation.
        // I.e. not the initial load but the location has now changed.
        // Note that in local development, where you use `localhost:3000`
        // this will always be true because it's always client-side navigation.
        ga("set", "dimension19", "Yes");
        ga("send", {
          hitType: "pageview",
          location: window.location.toString(),
        });
      }
      // By counting every time a document is mounted, we can use this to know if
      // a client-side navigation happened.
      mountCounter.current++;
    }
  }, [query, page, ga]);

  return (
    <div className="site-search">
      <PageContentContainer>
        {!isServer && query && (
          <React.Suspense fallback={<LoadingPlaceholder />}>
            <SearchResults />
          </React.Suspense>
        )}
      </PageContentContainer>
    </div>
  );
}
