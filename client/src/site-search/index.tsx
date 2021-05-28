import React from "react";
import { useSearchParams } from "react-router-dom";

import { Loading } from "../ui/atoms/loading";
import { PageContentContainer } from "../ui/atoms/page-content";
import { useGA } from "../ga-context";
import "./index.scss";

const SiteSearchForm = React.lazy(() => import("./form"));
const SearchResults = React.lazy(() => import("./search-results"));

export function SiteSearch() {
  const isServer = typeof window === "undefined";
  const ga = useGA();
  const [searchParams] = useSearchParams();

  const query = searchParams.get("q");
  const page = searchParams.get("page");
  React.useEffect(() => {
    if (query) {
      let title = `Search: "${query}"`;
      if (page && page !== "1") {
        title += ` (page ${page})`;
      }
      document.title = title;
    } else {
      document.title = "No query, no results.";
    }
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
    <div className="site-search main-page-content">
      <PageContentContainer>
        {query ? (
          <h1>
            Search results for: <span className="query-string">{query}</span>{" "}
            {page && page !== "1" && `(page ${page})`}
          </h1>
        ) : (
          <h1>No query, no results.</h1>
        )}

        {!isServer && (
          <React.Suspense fallback={<Loading />}>
            <SiteSearchForm />
          </React.Suspense>
        )}

        {!isServer && query && (
          <React.Suspense fallback={<Loading />}>
            <SearchResults />
          </React.Suspense>
        )}
      </PageContentContainer>
    </div>
  );
}
