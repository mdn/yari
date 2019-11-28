import { Link } from "@reach/router";
import React from "react";
import { useSearch } from "./search-index";
import "./search-page.scss";

const PAGE_SIZE = 10;

export function SearchPage({ query }) {
  const search = useSearch();
  const [results, setResults] = React.useState([]);
  const [pageIndex, setPageIndex] = React.useState(0);

  React.useEffect(() => {
    if (search && !(search instanceof Error)) {
      setResults(search.flex(query));
    }
  }, [search, query]);

  const pageStart = pageIndex * PAGE_SIZE;
  const pageEnd = pageStart + PAGE_SIZE;
  return (
    <>
      <h1>Results: {query}</h1>
      <p>
        <em>
          {results.length} documents for "{query}" in en-US. Showing results{" "}
          {pageStart + 1} to {Math.max(pageEnd, results.length)}.
        </em>
      </p>
      <ul className="search-page-results">
        {results.slice(pageStart, pageEnd).map(slug => (
          <li key={slug}>
            <Link to={slug}>
              <b>{search.titles[slug].title}</b>
              <br />
              {slug}
            </Link>
          </li>
        ))}
        {pageIndex > 0 && (
          <button type="button" onClick={() => setPageIndex(pageIndex - 1)}>
            Previous
          </button>
        )}
        {pageEnd < results.length && (
          <button type="button" onClick={() => setPageIndex(pageIndex + 1)}>
            Next
          </button>
        )}
      </ul>
    </>
  );
}
