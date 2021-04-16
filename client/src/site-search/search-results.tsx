import React from "react";
import { Link, createSearchParams, useSearchParams } from "react-router-dom";
import useSWR from "swr";

import { CRUD_MODE } from "../constants";
import { useLocale } from "../hooks";
import { appendURL } from "./utils";

import LANGUAGES_RAW from "../languages.json";
import "./search-results.scss";
import { useGA } from "../ga-context";

const LANGUAGES = new Map(
  Object.entries(LANGUAGES_RAW).map(([locale, data]) => {
    return [locale.toLowerCase(), data];
  })
);

const SORT_OPTIONS = [
  ["best", "Best"],
  ["relevance", "Relevance"],
  ["popularity", "Popularity"],
];

type Highlight = {
  body?: string[];
  title?: string[];
};
interface Document {
  mdn_url: string;
  locale: string;
  title: string;
  highlight: Highlight;
  summary: string;
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

export default function SearchResults() {
  const ga = useGA();
  const [searchParams] = useSearchParams();
  const locale = useLocale();
  // A call to `/api/v1/search` will default to mean the same thing as
  // a call to `/api/v1/search?locale=en-us`. But if they page you're currently
  // on, (e.g. `/ja/search`) we should supply a more explicit default.
  const sp = createSearchParams(searchParams);
  if (!searchParams.getAll("locale").length) {
    // In other words, if it's not explicitly set by the current query string,
    // force in the locale based on the current URL (path).
    sp.set("locale", locale);
  }
  const fetchURL = `/api/v1/search?${sp.toString()}`;

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

      // See docs/experiments/0001_site-search-x-cache.md
      const xCacheHeaderValue = response.headers.get("x-cache");
      ga("send", {
        hitType: "event",
        eventCategory: "Site-search X-Cache",
        eventAction: url,
        eventLabel: xCacheHeaderValue || "no value",
      });

      return await response.json();
    },
    {
      revalidateOnFocus: process.env.NODE_ENV === "development",
    }
  );

  const page = searchParams.get("page");
  const [initialPage, setInitialPage] = React.useState(page);
  React.useEffect(() => {
    if (page !== initialPage) {
      setInitialPage(page);
      const resultsElement = document.querySelector("div.site-search");
      if (resultsElement) {
        resultsElement.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [page, initialPage]);

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
      <>
        {/* It only makes sense to display the sorting options if anything was found */}
        {hitCount > 1 && <SortOptions />}

        <RemoteSearchWarning />

        <Results {...data} />

        <Pagination
          currentPage={currentPage}
          hitCount={hitCount}
          pageSize={pageSize}
          maxPage={10}
        />
      </>
    );
  }
  // else...
  return (
    <div className="loading-wrapper">
      <p>Loading search results...</p>
    </div>
  );
}

function RemoteSearchWarning() {
  if (CRUD_MODE) {
    // If you're in CRUD_MODE, the search results will be proxied from a remote
    // Kuma and it might be confusing if a writer is wondering why their
    // actively worked-on content isn't showing up in searches.
    // The default value in the server is not accessible from the react app,
    // so it's hardcoded here in the client.
    const kumaHost = process.env.REACT_APP_KUMA_HOST || "developer.mozilla.org";
    return (
      <div className="notecard warning">
        <h4>Note!</h4>
        <p>
          Site-search is proxied to <code>{kumaHost}</code> which means that
          some content found doesn't reflect what's in your current branch.
        </p>
      </div>
    );
  }
  return null;
}

function SortOptions() {
  const [searchParams] = useSearchParams();
  const querySort = searchParams.get("sort") || SORT_OPTIONS[0][0];
  return (
    <div className="sort-options">
      <h2>Sort by:</h2>
      <ul className="sort-option-list">
        {SORT_OPTIONS.map(([key, label], i) => {
          return (
            <li key={key}>
              {key === querySort ? (
                label
              ) : (
                <Link to={`?${appendURL(searchParams, { sort: key })}`}>
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
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
      <p>The search failed because the server failed to respond.</p>
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
}: {
  documents: Document[];
  metadata: Metadata;
  suggestions: Suggestion[];
}) {
  const locale = useLocale();
  const [searchParams] = useSearchParams();

  return (
    <div className="search-results">
      <p>
        Found <ShowTotal total={metadata.total} /> in {metadata.took_ms}{" "}
        milliseconds.
      </p>

      {!!suggestions.length && (
        <div className="search-suggestions">
          <p>Did you mean...</p>
          <ul className="search-suggestion-list">
            {suggestions.map((suggestion) => {
              return (
                <li key={suggestion.text}>
                  <Link
                    to={`?${appendURL(searchParams, {
                      q: suggestion.text,
                      page: undefined,
                    })}`}
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

      <ul className="search-results-list readable-line-length">
        {documents.map((document) => {
          const highlights = document.highlight.body || [];
          return (
            <li className="search-result-entry" key={document.mdn_url}>
              {/* We're using plain <a href> instead of <Link to> here until
                the bug has been figured out about scrolling to the top on click. */}
              {document.highlight.title && document.highlight.title.length ? (
                <h3 className="title">
                  <a
                    href={document.mdn_url}
                    dangerouslySetInnerHTML={{
                      __html: document.highlight.title[0],
                    }}
                  ></a>
                </h3>
              ) : (
                <h3 className="title">
                  <a href={document.mdn_url}>{document.title}</a>
                </h3>
              )}{" "}
              {locale.toLowerCase() !== document.locale &&
                LANGUAGES.has(document.locale) && (
                  <span
                    className="locale-indicator"
                    title={`The linked document is in ${
                      LANGUAGES.get(document.locale)?.English
                    } which is different from your current locale.`}
                  >
                    {LANGUAGES.get(document.locale)?.English}
                  </span>
                )}
              <p className="search-result-url">
                <a href={document.mdn_url}>{document.mdn_url}</a>
              </p>
              <p>
                {highlights.length ? (
                  highlights.map((highlight, i) => {
                    return (
                      <span
                        key={`${document.mdn_url}${i}`}
                        className="highlight"
                        dangerouslySetInnerHTML={{ __html: `…${highlight}…` }}
                      ></span>
                    );
                  })
                ) : (
                  <span className="summary">{document.summary}</span>
                )}
              </p>
              {searchParams.get("debug") !== null && (
                <span className="nerd-data">
                  <b>score:</b> <code>{document.score}</code>,{" "}
                  <b>popularity:</b> <code>{document.popularity}</code>,{" "}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
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

function Pagination({
  currentPage,
  maxPage,
  hitCount,
  pageSize,
}: {
  currentPage: number;
  maxPage: number;
  hitCount: number;
  pageSize: number;
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

  if (nextPage || previousPage !== null) {
    let previousURL = "";
    if (previousPage) {
      if (previousPage === 1) {
        previousURL = `?${appendURL(searchParams, {
          page: undefined,
        })}`;
      } else {
        previousURL = `?${appendURL(searchParams, {
          page: `${previousPage}`,
        })}`;
      }
    }
    return (
      <ul className="pagination readable-line-length">
        {previousURL ? (
          <li>
            <Link to={previousURL} className="button">
              Previous
            </Link>
          </li>
        ) : null}{" "}
        {nextPage ? (
          <li>
            <Link
              to={`?${appendURL(searchParams, { page: `${nextPage}` })}`}
              className="button"
            >
              Next
            </Link>
          </li>
        ) : null}
      </ul>
    );
  }
  return null;
}
