import React from "react";
import {
  createSearchParams,
  Link,
  useParams,
  useSearchParams,
} from "react-router-dom";
import useSWR from "swr";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import "./index.scss";

import { PageContentContainer } from "../ui/atoms/page-content";

dayjs.extend(relativeTime);

interface DocumentPopularity {
  value: number;
  ranking: number;
  parentValue: number;
  parentRanking: number;
}

type CountByType = { [key: string]: number };

interface DocumentDifferences {
  countByType: CountByType;
  total: number;
}

interface DocumentEdits {
  modified: string;
  parentModified: string;
  commitURL: string;
  parentCommitURL: string;
}

interface Document {
  mdn_url: string;
  edits: DocumentEdits;
  title: string;
  popularity: DocumentPopularity;
  differences: DocumentDifferences;
}

interface Counts {
  found: number;
  total: number;
  pages: number;
  noParents: number;
  cacheMisses: number;
}

interface Times {
  took: number;
}

interface FlawLevel {
  name: string;
  level: string;
  ignored: boolean;
}

interface Locale {
  locale: string;
  language: {
    English: string;
    native: string;
  };
  isActive: boolean;
}

interface Data {
  counts: Counts;
  documents: Document[];
  times: Times;
  flawLevels: FlawLevel[];
}

interface LocalesData {
  locales: Locale[];
}

interface LocaleStorageData {
  lastLoadTime?: number;
}
interface StorageData {
  [locale: string]: LocaleStorageData;
}

const LOCALSTORAGE_KEY = "translations-dashboard";

function saveStorage(locale: string, data: LocaleStorageData) {
  try {
    const stored = JSON.parse(
      localStorage.getItem(LOCALSTORAGE_KEY) || "{}"
    ) as StorageData;
    stored[locale] = Object.assign({}, stored[locale] || {}, data);
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(stored));
  } catch (err) {
    console.warn("Unable to save to localStorage", err);
  }
}

function getStorage(locale: string): LocaleStorageData | null {
  try {
    const stored = JSON.parse(localStorage.getItem(LOCALSTORAGE_KEY) || "{}");
    if (stored) {
      return stored[locale] as LocaleStorageData;
    }
  } catch (err) {
    console.warn("Unable to retrieve from localStorage", err);
  }
  return null;
}

export default function AllTranslations() {
  const { locale } = useParams();

  const [lastData, setLastData] = React.useState<Data | null>(null);

  React.useEffect(() => {
    let title = "All translations";
    if (locale.toLowerCase() !== "en-us") {
      title += ` for ${locale}`;
    }
    if (lastData) {
      title = `(${lastData.counts.found.toLocaleString()} found) ${title}`;
    }
    document.title = title;
  }, [lastData, locale]);

  const getAPIUrl = React.useCallback(() => {
    const params = createSearchParams({
      locale,
    });
    return `/_translations?${params.toString()}`;
  }, [locale]);

  const { data, error, isValidating } = useSWR<Data, Error>(
    locale.toLowerCase() !== "en-us" ? getAPIUrl() : null,
    async (url) => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`${response.status} (${await response.text()})`);
      }
      if (
        !(response.headers.get("content-type") || "").includes(
          "application/json"
        )
      ) {
        throw new Error(
          `Response is not JSON (${response.headers.get("content-type")})`
        );
      }
      return response.json();
    },
    {
      revalidateOnFocus: false,
    }
  );

  // Use this to be able to figure out how long the XHR takes when there's no cache
  const startTime = React.useRef<Date>();
  React.useEffect(() => {
    if (locale) {
      if (!data) {
        startTime.current = new Date();
      } else {
        if (
          data.counts.cacheMisses > 0 &&
          data.counts.cacheMisses === data.counts.total &&
          startTime.current
        ) {
          const lastLoadTime =
            new Date().getTime() - startTime.current.getTime();
          saveStorage(locale, { lastLoadTime });
        }
      }
    }
  }, [locale, data]);

  const { data: dataLocales, error: errorLocales } = useSWR<LocalesData, Error>(
    locale.toLowerCase() === "en-us" ? getAPIUrl() : null,
    async (url) => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`${response.status} (${await response.text()})`);
      }
      return response.json();
    }
  );

  React.useEffect(() => {
    if (data) {
      setLastData(data);
    }
  }, [data]);

  if (locale.toLowerCase() === "en-us") {
    return (
      <Container>
        {!dataLocales && !errorLocales && <Loading estimate={2000} />}
        {errorLocales && (
          <div className="error-message">
            <h3>Server error</h3>
            <pre>{errorLocales.toString()}</pre>
          </div>
        )}
        {dataLocales && <ShowLocales locales={dataLocales.locales} />}
      </Container>
    );
  }

  const lastStorageData = getStorage(locale);

  return (
    <Container>
      {lastData && !error && isValidating && (
        <p style={{ float: "right" }}>Reloading...</p>
      )}
      {!data && !error && !lastData && (
        <Loading
          estimate={
            (lastStorageData && lastStorageData.lastLoadTime) || 30 * 1000
          }
        />
      )}
      {error && <ShowSearchError error={error} />}
      {lastData && (
        <div className="filter-documents">
          <FilterControls />
          <DocumentsTable
            counts={lastData.counts}
            documents={lastData.documents}
          />
        </div>
      )}
      {data && <BuildTimes times={data.times} />}
    </Container>
  );
}

function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="all-translations">
      <PageContentContainer>{children}</PageContentContainer>
    </div>
  );
}

function ShowLocales({ locales }: { locales: Locale[] }) {
  return (
    <div>
      <h2>Select a locale</h2>
      <ul>
        {locales.map((locale) => {
          return (
            <li key={locale.locale}>
              <Link to={`/${locale.locale}/_translations`}>
                {locale.language.English} ({locale.locale})
              </Link>{" "}
              {!locale.isActive && <small>not active</small>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ShowSearchError({ error }) {
  return (
    <div className="error-message search-error">
      <h3>Search error</h3>
      <pre>{error.toString()}</pre>
    </div>
  );
}

function BuildTimes({ times }: { times: Times }) {
  function format(ms: number) {
    if (ms > 1000) {
      const s = ms / 1000;
      return `${s.toFixed(1)} seconds`;
    } else {
      return `${Math.trunc(ms)} milliseconds`;
    }
  }
  return (
    <div className="search-times">
      <p>Time to find all documents {format(times.took)}</p>
    </div>
  );
}

function Loading({ estimate }: { estimate: number }) {
  const startLoadingTime = new Date();
  const [estimateEndTime] = React.useState(
    new Date(startLoadingTime.getTime() + estimate)
  );

  const INTERVAL_INCREMENT = 700;
  const [elapsed, setElapsed] = React.useState(0);
  React.useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((state) => state + INTERVAL_INCREMENT);
    }, INTERVAL_INCREMENT);
    return () => clearInterval(interval);
  }, []);

  const distance = estimateEndTime.getTime() - startLoadingTime.getTime();
  const percent = (100 * elapsed) / distance;
  return (
    <div className="loading">
      <progress id="progress" max="100" value={percent} style={{ margin: 20 }}>
        {percent}%
      </progress>
      <br />
      <small>
        Estimated time to finish: {((distance - elapsed) / 1000).toFixed(0)}s{" "}
        {elapsed > distance ? <span>🙃</span> : null}
      </small>
    </div>
  );
}

function FilterControls() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [title, setTitle] = React.useState(searchParams.get("title") || "");
  const [url, setURL] = React.useState(searchParams.get("url") || "");

  function refreshFilters(reset = false) {
    const create = createSearchParams(searchParams);
    for (const [key, value] of [
      ["url", url],
      ["title", title],
    ]) {
      if (!reset && value) {
        create.set(key, value);
      } else {
        create.delete(key);
      }
    }
    create.delete("page");
    setSearchParams(create);
  }

  function resetFilters() {
    setURL("");
    setTitle("");
    refreshFilters(true);
  }

  return (
    <div className="filters">
      <h3>Filters</h3>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          refreshFilters();
        }}
      >
        <div>
          <h4>Document</h4>
          <input
            type="search"
            placeholder="Filter by document URI"
            value={url}
            onChange={(event) => {
              setURL(event.target.value);
            }}
            onBlur={() => refreshFilters()}
          />
          <input
            type="search"
            placeholder="Filter by document title"
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
            }}
            onBlur={() => refreshFilters()}
          />
        </div>

        <div>
          <h4>&nbsp;</h4>
          <button type="submit">Filter now</button>
          {(url || title) && (
            <button type="button" onClick={resetFilters}>
              Reset filters
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function DocumentsTable({
  counts,
  documents,
}: {
  counts: Counts;
  documents: Document[];
}) {
  const [searchParams, setSearchParams] = useSearchParams();

  const sort = searchParams.get("sort") || "modified";
  const sortReverse = JSON.parse(searchParams.get("sortReverse") || "false");

  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);
  const filterTitle = searchParams.get("title") || "";
  const filterURL = searchParams.get("url") || "";

  // https://gist.github.com/jlbruno/1535691/db35b4f3af3dcbb42babc01541410f291a8e8fac
  function getGetOrdinal(n: number) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n.toLocaleString() + (s[(v - 20) % 10] || s[v] || s[0]);
  }

  function TH({ id, title }: { id: string; title: string }) {
    return (
      <th
        onClick={() => {
          if (sort === id) {
            setSearchParams(
              createSearchParams({
                sort: id,
                sortReverse: JSON.stringify(!sortReverse),
              })
            );
          } else {
            setSearchParams(createSearchParams({ sort: id }));
          }
        }}
        className={`sortable ${sort === id ? "active" : ""} ${
          sort === id && sortReverse ? "reverse" : ""
        }`}
      >
        {title}
      </th>
    );
  }

  function getHighlightedText(text: string, highlight: string) {
    // Split on highlight term and include term into parts, ignore case
    const parts = text.split(new RegExp(`(${highlight})`, "gi"));
    return (
      <span>
        {" "}
        {parts.map((part, i) => (
          <span
            key={i}
            style={
              part.toLowerCase() === highlight.toLowerCase()
                ? { fontWeight: "bold" }
                : {}
            }
          >
            {part}
          </span>
        ))}{" "}
      </span>
    );
  }

  function showBriefURL(uri: string) {
    const [left, right] = uri.split(/\/docs\//, 2);
    return (
      <>
        <span className="url-prefix">{left}/docs/</span>
        <span className="url-slug">
          {filterURL ? getHighlightedText(right, filterURL) : right}
        </span>
      </>
    );
  }

  function showLastModified(doc: Document) {
    const { edits } = doc;
    const modified = dayjs(edits.modified);
    const parentModified = dayjs(edits.parentModified);
    return (
      <span
        className={`last_modified ${
          parentModified < modified ? "ahead" : "behind"
        }`}
      >
        <a href={edits.commitURL} target="_blank" rel="noreferrer">
          <time
            dateTime={modified.toISOString()}
            title={modified.toISOString()}
          >
            {modified.fromNow()}
          </time>
        </a>
        <br />
        <a href={edits.parentCommitURL} target="_blank" rel="noreferrer">
          <small>
            <time
              dateTime={parentModified.toISOString()}
              title={parentModified.toISOString()}
            >
              en-US {parentModified.fromNow()}
            </time>
          </small>
        </a>
      </span>
    );
  }

  const filteredDocuments = documents
    .filter((document) => {
      if (
        filterTitle &&
        !document.title.toLowerCase().includes(filterTitle.toLowerCase())
      ) {
        return false;
      }

      if (
        filterURL &&
        !document.mdn_url.toLowerCase().includes(filterURL.toLowerCase())
      ) {
        return false;
      }

      return true;
    })
    .sort((A, B) => {
      let reverse = sortReverse ? -1 : 1;
      if (sort === "modified") {
        const a = new Date(A.edits.modified);
        const b = new Date(B.edits.modified);
        return reverse * (b.getTime() - a.getTime());
      } else if (sort === "popularity") {
        const a = A.popularity.value;
        const b = B.popularity.value;
        return reverse * (b - a);
      } else if (sort === "differences") {
        const a = A.differences.total;
        const b = B.differences.total;
        return reverse * (b - a);
      } else if (sort === "mdn_url") {
        const a = A.mdn_url;
        const b = B.mdn_url;
        return reverse * a.localeCompare(b);
      } else {
        throw new Error(`Unrecognized sort '${sort}'`);
      }
    });
  const pageCount = Math.ceil(counts.found / pageSize);

  return (
    <div className="documents">
      <h3>
        Documents found ({filteredDocuments.length.toLocaleString()}){" "}
        {page > 1 && <span className="page">page {page}</span>}{" "}
        <small>of {counts.total.toLocaleString()} in total</small>
      </h3>

      <table>
        <thead>
          <tr>
            <TH id="mdn_url" title="Document" />
            <TH id="popularity" title="Popularity" />
            <TH id="modified" title="Last modified" />
            <TH id="differences" title="Differences" />
          </tr>
        </thead>
        <tbody>
          {filteredDocuments
            .slice((page - 1) * pageSize, page * pageSize)
            .map((doc: Document) => {
              return (
                <tr key={doc.mdn_url}>
                  <td>
                    <Link
                      to={`${doc.mdn_url}#_flaws`}
                      title={doc.title}
                      target="_blank"
                    >
                      {showBriefURL(doc.mdn_url)}
                    </Link>
                    <br />
                    <span className="document-title-preview">
                      {filterTitle
                        ? getHighlightedText(doc.title, filterTitle)
                        : doc.title}
                    </span>
                  </td>
                  <td
                    title={
                      doc.popularity.ranking
                        ? `Meaning there are ${
                            doc.popularity.ranking - 1
                          } more popular pages than this`
                        : "Meaning it has no ranking. Most likely a very rare (or new) document"
                    }
                  >
                    {!doc.popularity.ranking
                      ? "n/a"
                      : `${getGetOrdinal(doc.popularity.ranking)}`}{" "}
                    <small title="For the parent document">
                      (
                      {!doc.popularity.parentRanking
                        ? "n/a"
                        : `${getGetOrdinal(doc.popularity.parentRanking)}`}
                      )
                    </small>
                  </td>
                  <td>{showLastModified(doc)}</td>
                  <td>{doc.differences.total.toLocaleString()}</td>
                </tr>
              );
            })}
        </tbody>
      </table>
      {pageCount > 1 && (
        <p className="pagination">
          <PageLink number={1} disabled={page === 1}>
            First page
          </PageLink>{" "}
          {page > 2 && (
            <PageLink number={page - 1}>Previous page ({page - 1})</PageLink>
          )}{" "}
          <PageLink number={page + 1} disabled={page + 1 > pageCount}>
            Next page ({page + 1})
          </PageLink>
        </p>
      )}
    </div>
  );
}

function PageLink({
  number,
  disabled,
  children,
}: {
  number: number;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  const [searchParams] = useSearchParams();
  const params = createSearchParams(searchParams);
  if (number > 1) {
    params.set("page", `${number}`);
  } else {
    params.delete("page");
  }
  return (
    <Link
      to={"?" + params.toString()}
      className={disabled ? "disabled" : ""}
      onClick={(event) => {
        if (disabled) {
          event.preventDefault();
        }
        const top = document.querySelector("div.all-translations");
        if (top) {
          top.scrollIntoView({ behavior: "smooth" });
        }
      }}
    >
      {children}
    </Link>
  );
}
