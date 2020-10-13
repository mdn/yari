import React, { lazy, Suspense, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import { useLocale } from "../hooks";
import "./index.scss";
const SearchResults = lazy(() => import("./search-results"));

export function SiteSearch() {
  const isServer = typeof window === "undefined";

  const locale = useLocale();

  // const [searchParams] = useSearchParams({ q: "" });
  const [searchParams] = (useSearchParams as any)();
  const q = (searchParams.get("q") as string) || "";

  const query = {
    q,
    locale,
  };

  useEffect(() => {
    if (query.q) {
      document.title = `Search results for: "${query.q}"`;
    } else {
      document.title = "No query, no results.";
    }
  }, [query]);

  return (
    <div id="site-search">
      {query.q ? <h1>Results: {query.q}</h1> : <h1>No query, no results.</h1>}

      {!isServer && query.q && (
        <Suspense fallback={<p>Loading...</p>}>
          <SearchResults query={new URLSearchParams(query)} />
        </Suspense>
      )}
    </div>
  );
}
