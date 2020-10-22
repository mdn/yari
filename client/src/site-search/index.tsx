import React, { lazy, Suspense, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { useLocale } from "../hooks";
import "./index.scss";
const SearchResults = lazy(() => import("./search-results"));

type Query = {
  q: string;
  locale: string[];
  page?: string;
};

export function SiteSearch() {
  const isServer = typeof window === "undefined";

  const locale = useLocale();
  const [searchParams, setSearchParams] = useSearchParams();
  const [q, setQ] = useState("");

  const query: Query = {
    q: searchParams.get("q") || "",
    locale: [locale || "en-US"],
    page: searchParams.get("page") || "",
  };

  useEffect(() => {
    if (query.q) {
      let title = `Search: "${query.q}"`;
      if (query.page && query.page !== "1") {
        title += ` (page ${query.page})`;
      }
      document.title = title;
    } else {
      document.title = "No query, no results.";
    }
  }, [query]);

  return (
    <div id="site-search">
      {query.q ? (
        <h1>
          Results: {query.q}{" "}
          {query.page && query.page !== "1" && (
            <small className="current-page">Page {query.page}</small>
          )}
        </h1>
      ) : (
        <h1>No query, no results.</h1>
      )}

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
