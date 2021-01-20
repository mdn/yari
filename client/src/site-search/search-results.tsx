import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import useSWR from "swr";

import "./search-results.scss";

import { SiteSearchQuery } from "./types";

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

interface FormErrorMessage {
  message: string;
  code: string;
}
type FormErrors = [{ key: string }, FormErrorMessage[]];

class BadRequestError extends Error {
  public formErrors: FormErrors;

  constructor(formErrors: FormErrors) {
    super(`BadRequestError ${JSON.stringify(formErrors)}`);
    this.formErrors = formErrors;
  }
}

class ServerOperationalError extends Error {
  public statusCode: number;
  constructor(statusCode: number) {
    super(`ServerOperationalError ${statusCode}`);
    this.statusCode = statusCode;
  }
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

export default function SearchResults({
  query,
  updateQuery,
}: {
  query: SiteSearchQuery;
  updateQuery: (query: SiteSearchQuery) => void;
}) {
  const fetchURL = `/api/v1/search?${new URLSearchParams(
    queryToSequence(query)
  ).toString()}`;

  const { data, error } = useSWR(
    fetchURL,
    async (url) => {
      const response = await fetch(url);
      if (response.status === 400) {
        const badRequest = await response.json();
        throw new BadRequestError(badRequest.errors);
      } else if (response.status >= 500) {
        throw new ServerOperationalError(response.status);
      } else if (!response.ok) {
        throw new Error(`${response.status} on ${url}`);
      }
      return await response.json();
    },
    {
      revalidateOnFocus: process.env.NODE_ENV === "development",
    }
  );

  const [initialPage, setInitialPage] = React.useState(query.page);
  React.useEffect(() => {
    if (query.page !== initialPage) {
      setInitialPage(query.page);
      const resultsElement = document.querySelector("div.site-search");
      if (resultsElement) {
        resultsElement.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [query, initialPage]);

  if (error) {
    if (error instanceof BadRequestError) {
      return (
        <SearchErrorContainer>
          <ExplainBadRequestError errors={error.formErrors} />
        </SearchErrorContainer>
      );
    }

    if (error instanceof ServerOperationalError) {
      return (
        <SearchErrorContainer>
          <ExplainServerOperationalError statusCode={error.statusCode} />
        </SearchErrorContainer>
      );
    }

    return (
      <SearchErrorContainer>
        <p>Something else when horribly wrong with the search</p>
        <p>
          <code>{error.toString()}</code>
        </p>
      </SearchErrorContainer>
    );
  }

  if (data) {
    const currentPage = data.metadata.page;
    const pageSize = data.metadata.size;
    const hitCount = data.metadata.total.value;

    return (
      <div>
        <Results {...data} query={query} updateQuery={updateQuery} />
        <Pagination
          currentPage={currentPage}
          hitCount={hitCount}
          pageSize={pageSize}
          maxPage={10}
          query={query}
          updateQuery={updateQuery}
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

function SearchErrorContainer({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <h3>Search error</h3>
      {children}
    </div>
  );
}

function ExplainBadRequestError({ errors }: { errors: FormErrors }) {
  return (
    <div className="notecard warning">
      <p>The search didn't work because there were problems with the input.</p>
      <ul>
        {Object.keys(errors).map((key) => {
          const messages: FormErrorMessage[] = errors[key];
          return (
            <li key={key}>
              <code>{key}</code>{" "}
              {messages.map((message) => {
                return <b key={message.code}>{message.message}</b>;
              })}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ExplainServerOperationalError({ statusCode }: { statusCode: number }) {
  return (
    <div className="notecard warning">
      <p>The search failed because the server failed to response.</p>
      <p>
        If you're curious, it was a <b>{statusCode}</b> error.
      </p>
      <p>
        <button
          onClick={() => {
            window.location.reload();
          }}
        >
          Try reloading
        </button>
      </p>
    </div>
  );
}

function Results({
  documents,
  metadata,
  suggestions,
  query,
  updateQuery,
}: {
  documents: Document[];
  metadata: Metadata;
  suggestions: Suggestion[];
  query: SiteSearchQuery;
  updateQuery: (query: SiteSearchQuery) => void;
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
                const queryClone = Object.assign({}, query, {
                  q: suggestion.text,
                });
                const newQuery = new URLSearchParams(
                  queryToSequence(queryClone)
                );
                return (
                  <li key={suggestion.text}>
                    <Link
                      to={`?${newQuery}`}
                      onClick={(event) => {
                        event.preventDefault();
                        updateQuery(queryClone);
                      }}
                    >
                      {suggestion.text}
                    </Link>{" "}
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
                {/* We're using plain <a href> instead of <Link to> here until
                the bug has been figured out about scrolling to the top on click. */}
                {document.highlight.title && document.highlight.title.length ? (
                  <a
                    className="title"
                    href={document.mdn_url}
                    dangerouslySetInnerHTML={{
                      __html: document.highlight.title[0],
                    }}
                  ></a>
                ) : (
                  <a className="title" href={document.mdn_url}>
                    {document.title}
                  </a>
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
                <a className="url" href={document.mdn_url}>
                  {document.mdn_url}
                </a>
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
  const [maxIsVisible, setMaxIsVisible] = React.useState(0);

  React.useEffect(() => {
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
  query,
  updateQuery,
}: {
  currentPage: number;
  maxPage: number;
  hitCount: number;
  pageSize: number;
  query: SiteSearchQuery;
  updateQuery: (query: SiteSearchQuery) => void;
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
          <Link to={`?${makeNewQuery(previousPage)}`} className="button">
            Previous
          </Link>
        ) : null}{" "}
        {nextPage ? (
          <Link to={`?${makeNewQuery(nextPage)}`} className="button">
            Next
          </Link>
        ) : null}
      </div>
    );
  }
  return null;
}
