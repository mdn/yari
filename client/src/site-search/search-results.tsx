import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import useSWR from "swr";

import "./search-results.scss";

type Highlight = {
  body?: string[];
  title?: string[];
};
interface Document {
  mdn_url: string;
  title: string;
  highlight: Highlight;
  score: number;
  popularity: number;
}

type Total = {
  value: number;
  relation: "eq" | "gt";
};

interface Metadata {
  // The time it took Elasticsearch query
  took_ms: number;
  // The time it took Kuma's API to wrap the Elasticsearch query
  api_took_ms: number;
  total: Total;
}

interface Suggestion {
  text: string;
  total: Total;
}

export default function SearchResults({ query }: { query: URLSearchParams }) {
  const fetchURL = `/api/v1/search/?${query.toString()}`;
  const { data, error } = useSWR(
    fetchURL,
    async (url) => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`${response.status} on ${url}`);
      }
      return await response.json();
    },
    {
      revalidateOnFocus: process.env.NODE_ENV === "development",
    }
  );

  if (error) {
    return (
      <div>
        <h4>Search error</h4>
        <p>{error.toString()}</p>
      </div>
    );
  }

  if (data) {
    const currentPage = data.metadata.page;
    const pageSize = data.metadata.size;
    const hitCount = data.metadata.total.value;

    return (
      <div>
        <Results {...data} query={query} />
        <Pagination
          currentPage={currentPage}
          hitCount={hitCount}
          pageSize={pageSize}
          maxPage={10}
          onPaginate={() => {
            const resultsElement = document.querySelector("#site-search");
            if (resultsElement) {
              resultsElement.scrollIntoView({ behavior: "smooth" });
            }
          }}
        />
      </div>
    );
  }
  // else...
  return (
    <div className="loading-wrapper">
      <p>Loading search results...</p>
    </div>
  );
}

function Results({
  documents,
  metadata,
  suggestions,
  query,
}: {
  documents: Document[];
  metadata: Metadata;
  suggestions: Suggestion[];
  query: URLSearchParams;
}) {
  return (
    <FadeIn delay={50}>
      <div className="search-results">
        <p>
          Found <ShowTotal total={metadata.total} /> in {metadata.took_ms}{" "}
          milliseconds.
        </p>

        {!!suggestions.length && (
          <div className="suggestions">
            <p>Did you mean...</p>
            <ul>
              {suggestions.map((suggestion) => {
                const newQuery = new URLSearchParams(query);
                newQuery.set("q", suggestion.text);
                return (
                  <li key={suggestion.text}>
                    <Link to={`?${newQuery}`}>{suggestion.text}</Link>{" "}
                    <ShowTotal total={suggestion.total} />
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {documents.map((document) => {
          return (
            <div key={document.mdn_url}>
              <p>
                {document.highlight.title && document.highlight.title.length ? (
                  <Link
                    className="title"
                    to={document.mdn_url}
                    dangerouslySetInnerHTML={{
                      __html: document.highlight.title[0],
                    }}
                  ></Link>
                ) : (
                  <Link className="title" to={document.mdn_url}>
                    {document.title}
                  </Link>
                )}
                {(document.highlight.body || []).map((highlight, i) => {
                  return (
                    <span
                      key={`${document.mdn_url}${i}`}
                      className="highlight"
                      dangerouslySetInnerHTML={{ __html: `…${highlight}…` }}
                    ></span>
                  );
                })}
                <Link className="url" to={document.mdn_url}>
                  {document.mdn_url}
                </Link>
                {process.env.NODE_ENV === "development" && (
                  <span className="nerd-data">
                    <b>score:</b> <code>{document.score}</code>,{" "}
                    <b>popularity:</b> <code>{document.popularity}</code>,{" "}
                  </span>
                )}
              </p>
            </div>
          );
        })}
      </div>
    </FadeIn>
  );
}

function ShowTotal({ total }: { total: Total }) {
  return (
    <>
      {total.relation === "gt" && "more than"} {total.value.toLocaleString()}{" "}
      {total.value === 1 ? "match" : "matches"}
    </>
  );
}

interface FadeInProps {
  delay?: number;
  children: React.ReactNode;
}

function FadeIn(props: FadeInProps) {
  const [maxIsVisible, setMaxIsVisible] = useState(0);

  useEffect(() => {
    const count = React.Children.count(props.children);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      if (i > count) clearInterval(interval);
      setMaxIsVisible(i);
    }, props.delay || 50);
    return () => clearInterval(interval);
  });

  const transitionDuration = 250;
  return (
    <div>
      {React.Children.map(props.children, (child, i) => {
        return (
          <div
            style={{
              transition: `opacity ${transitionDuration}ms, transform ${transitionDuration}ms`,
              // transform: maxIsVisible > i ? "none" : "translateY(0px)",
              opacity: maxIsVisible > i ? 1 : 0,
            }}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
}

function Pagination({
  currentPage,
  maxPage,
  hitCount,
  pageSize,
  onPaginate,
}: {
  currentPage: number;
  maxPage: number;
  hitCount: number;
  pageSize: number;
  onPaginate: () => void;
}) {
  const [searchParams] = useSearchParams();

  if (!hitCount) {
    return null;
  }
  if (hitCount <= pageSize) {
    return null;
  }
  let previousPage: number | null = null;
  let nextPage: number | null = null;
  if (hitCount > currentPage * pageSize && currentPage < maxPage) {
    nextPage = currentPage + 1;
  }
  if (currentPage > 1) {
    previousPage = currentPage - 1;
  }

  function makeNewQuery(page: number) {
    const sp = new URLSearchParams(searchParams);
    if (page === 1) {
      sp.delete("page");
    } else {
      sp.set("page", `${page}`);
    }
    return sp.toString();
  }

  if (nextPage || previousPage !== null) {
    return (
      <div className="pagination">
        {previousPage ? (
          <Link
            to={`?${makeNewQuery(previousPage)}`}
            className="button"
            onClick={(event) => {
              onPaginate();
            }}
          >
            Previous
          </Link>
        ) : null}{" "}
        {nextPage ? (
          <Link
            to={`?${makeNewQuery(nextPage)}`}
            className="button"
            onClick={(event) => {
              onPaginate();
            }}
          >
            Next
          </Link>
        ) : null}
      </div>
    );
  }
  return null;
}
