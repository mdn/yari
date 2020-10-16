import React, { lazy, Suspense, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { useLocale } from "../hooks";
import "./index.scss";
const SearchResults = lazy(() => import("./search-results"));

type Query = {
  q: string;
  locale: string[];
};

export function SiteSearch() {
  const isServer = typeof window === "undefined";

  const locale = useLocale();
  const [searchParams, setSearchParams] = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") || "");

  const [query, setQuery] = useState<Query>({
    q,
    locale: [locale || "en-US"],
  });

  useEffect(() => {
    setQuery((state) => {
      return Object.assign({}, state, { q: searchParams.get("q") || "" });
    });
  }, [searchParams]);

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
          setSearchParams({ q });
        }}
      >
        <input
          type="search"
          name="q"
          value={q}
          onChange={(event) => setQ(event.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {!isServer && query.q && (
        <Suspense fallback={<p>Loading...</p>}>
          <SearchResults query={new URLSearchParams(queryToSequence(query))} />
        </Suspense>
      )}
    </div>
  );
}

type SequenceTuple = [string, string];

function queryToSequence(obj: Query): SequenceTuple[] {
  const sequence: SequenceTuple[] = [];
  Object.entries(obj).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      const expanded: SequenceTuple[] = value.map((v) => [key, `${v}`]);
      sequence.push(...expanded);
    } else {
      sequence.push([key, `${value}`]);
    }
  });
  return sequence;
}
