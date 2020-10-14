import React, { lazy, Suspense, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { useLocale } from "../hooks";
import "./index.scss";
const SearchResults = lazy(() => import("./search-results"));

type Query = {
  q: string;
  locale: string;
};

export function SiteSearch() {
  const isServer = typeof window === "undefined";

  const locale = useLocale();

  const [searchParams] = (useSearchParams as any)();
  const [q, setQ] = useState((searchParams.get("q") as string) || "");

  const [query, setQuery] = useState<Query>({
    q,
    locale,
  });

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

      <form
        action={`/${locale}/search`}
        onSubmit={(event) => {
          event.preventDefault();
          setQuery(Object.assign({}, query, { q }));
        }}
      >
        <input
          type="search"
          name="q"
          value={q}
          onChange={(event) => setQ(event.target.value)}
        />
        <button type="submit">Search again</button>
      </form>

      {!isServer && query.q && (
        <Suspense fallback={<p>Loading...</p>}>
          <SearchResults query={new URLSearchParams(query)} />
        </Suspense>
      )}
    </div>
  );
}
