import React from "react";
import { useSearchParams } from "react-router-dom";

import { PageContentContainer } from "../ui/atoms/page-content";
import { useGA } from "../ga-context";
import { useLocale } from "../hooks";
import "./index.scss";
import { SiteSearchQuery } from "./types";
// XXX Change this to lazy (maybe)
import SiteSearchForm from "./form";

const SearchResults = React.lazy(() => import("./search-results"));

export function SiteSearch() {
  const isServer = typeof window === "undefined";
  const ga = useGA();
  const locale = useLocale();
  const [searchParams, setSearchParams] = useSearchParams();
  // const [q, setQ] = useState(searchParams.get("q") || "");

  const query: SiteSearchQuery = {
    q: searchParams.get("q") || "",
    locale: [locale || "en-US"],
    page: searchParams.get("page") || "",
    sort: searchParams.get("sort") || "",
  };

  React.useEffect(() => {
    if (query.q) {
      let title = `Search: "${query.q}"`;
      if (query.page && query.page !== "1") {
        title += ` (page ${query.page})`;
      }
      document.title = title;
    } else {
      document.title = "No query, no results.";
    }
  }, [query.q, query.page]);

  // React.useEffect(() => {
  //   if (query.q) {
  //     setNewQ(query.q);
  //   }
  // }, [query.q]);

  const mountCounter = React.useRef(0);
  React.useEffect(() => {
    if (ga) {
      if (mountCounter.current > 0) {
        // 'dimension19' means it's a client-side navigation.
        // I.e. not the initial load but the location has now changed.
        // Note that in local development, where you use `localhost:3000`
        // this will always be true because it's always client-side navigation.
        ga("set", "dimension19", "Yes");
      }
      ga("send", {
        hitType: "pageview",
        location: window.location.toString(),
      });
      // By counting every time a document is mounted, we can use this to know if
      // a client-side navigation happened.
      mountCounter.current++;
    }
  }, [query.q, query.page, ga]);

  return (
    <div className="site-search">
      <PageContentContainer>
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

        <SiteSearchForm
          locale={locale}
          query={query}
          onSubmit={(query: SiteSearchQuery) => {
            // setSearchParams({ q: newQ });
            const newParams = { q: query.q };
            setSearchParams(newParams);
          }}
        />

        {!isServer && query.q && (
          <React.Suspense fallback={<p>Loading...</p>}>
            <SearchResults
              query={new URLSearchParams(queryToSequence(query))}
            />
          </React.Suspense>
        )}
      </PageContentContainer>
    </div>
  );
}

type SequenceTuple = [string, string];

function queryToSequence(obj: SiteSearchQuery): SequenceTuple[] {
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
