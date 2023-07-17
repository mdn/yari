import React from "react";
import {
  createSearchParams,
  Link,
  useSearchParams,
  useNavigate,
} from "react-router-dom";
import useSWR from "swr";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { MainContentContainer } from "../../ui/atoms/page-content";
import { Paginator } from "../../ui/molecules/paginator";
import { useLocale } from "../../hooks";

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
  missing: number;
  translated: number;
  total: number;
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

interface Data {
  counts: Counts;
  missingDocuments: Document[];
  times: Times;
  flawLevels: FlawLevel[];
}

interface LocaleStorageData {
  lastLoadTime?: number;
  defaultSort?: string;
  defaultSortReverse?: string;
}

interface StorageData {
  [locale: string]: LocaleStorageData;
}

const LOCALSTORAGE_KEY = "translations-dashboard-missing";

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

export function MissingTranslations() {
  const locale = useLocale();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [lastData, setLastData] = React.useState<Data | null>(null);

  React.useEffect(() => {
    if (locale.toLowerCase() === "en-us") {
      navigate(`/${locale}/_translations`);
    }
  }, [locale, navigate]);

  React.useEffect(() => {
    let title = "Missing translations";
    if (locale.toLowerCase() !== "en-us") {
      title += ` for ${locale}`;
    }
    if (lastData) {
      title = `(${lastData.counts.missing.toLocaleString()} found) ${title}`;
    }
    document.title = title;
  }, [lastData, locale]);

  const { data, error, isValidating } = useSWR<Data, Error>(
    locale.toLowerCase() !== "en-us"
      ? `/_translations/missing/?locale=${locale}`
      : null,
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

  React.useEffect(() => {
    if (data) {
      setLastData(data);
    }
  }, [data]);

  const lastStorageData = getStorage(locale);
  const defaultSort = lastStorageData?.defaultSort || "popularity";
  const defaultSortReverse = lastStorageData?.defaultSortReverse || "false";
  const sort = searchParams.get("sort") || defaultSort;
  const sortReverse = JSON.parse(
    searchParams.get("sortReverse") || defaultSortReverse
  );

  React.useEffect(() => {
    saveStorage(
      locale,
      Object.assign({}, lastStorageData, {
        defaultSort: sort,
        defaultSortReverse: sortReverse,
      })
    );
  }, [locale, sort, sortReverse, lastStorageData]);

  if (locale.toLowerCase() === "en-us") {
    return null;
  }

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
      {lastData && (
        <p style={{ textAlign: "right" }}>
          Go to{" "}
          <Link to={`/${locale}/_translations/differences`}>
            Translation differences for <b>{locale}</b>
          </Link>
        </p>
      )}
      {error && <ShowSearchError error={error} />}
      {lastData && (
        <div className="filter-documents">
          <FilterControls />
          <DocumentsTable
            counts={lastData.counts}
            documents={lastData.missingDocuments}
            sort={sort}
            sortReverse={sortReverse}
          />
        </div>
      )}
      {data && <BuildTimes times={data.times} />}
    </Container>
  );
}

function Container({ children }: { children: React.ReactNode }) {
  return (
    <MainContentContainer className="missing-translations" standalone={true}>
      {children}
    </MainContentContainer>
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

  const [, setIncrements] = React.useState(0);
  React.useEffect(() => {
    const interval = setInterval(() => {
      setIncrements((state) => state + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const distance = estimateEndTime.getTime() - startLoadingTime.getTime();
  const elapsed = new Date().getTime() - startLoadingTime.getTime();
  const percent = (100 * elapsed) / distance;
  return (
    <div className="loading">
      <progress id="progress" max="100" value={percent} style={{ margin: 20 }}>
        {percent}%
      </progress>
      <br />
      <small>
        Estimated time to finish: {((distance - elapsed) / 1000).toFixed(0)}s{" "}
        {elapsed > distance ? (
          <span aria-label="weird" role="img">
            🙃
          </span>
        ) : null}
      </small>
    </div>
  );
}

function FilterControls() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [title, setTitle] = React.useState(searchParams.get("title") || "");
  const [url, setURL] = React.useState(searchParams.get("url") || "");

  function refreshFilters(reset = false) {
    const filterParams = createSearchParams(searchParams);
    for (const [key, value] of [
      ["url", url],
      ["title", title],
    ]) {
      if (!reset && value) {
        filterParams.set(key, value);
      } else {
        filterParams.delete(key);
      }
    }
    filterParams.delete("page");
    setSearchParams(filterParams);
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
          <button type="submit">Filter now</button>{" "}
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
type NumericOperation = {
  operation: "eq" | "gt" | "gte" | "lt" | "lte";
  value: number;
};

function getNumericOperation(expression: string): NumericOperation | null {
  function parseIntOrThrow(v: string) {
    if (!v) {
      throw new Error("Can't be empty");
    }

    const parsed = parseInt(v, 10);
    if (isNaN(parsed)) {
      throw new Error(`'${v}' not a valid number`);
    }
    return parsed;
  }
  try {
    if (expression.startsWith(">=")) {
      return {
        operation: "gte",
        value: parseIntOrThrow(expression.replace(">=", "")),
      };
    } else if (expression.startsWith(">")) {
      return {
        operation: "gt",
        value: parseIntOrThrow(expression.replace(">", "")),
      };
    } else if (expression.startsWith("<=")) {
      return {
        operation: "lte",
        value: parseIntOrThrow(expression.replace("<=", "")),
      };
    } else if (expression.startsWith("<")) {
      return {
        operation: "lt",
        value: parseIntOrThrow(expression.replace("<", "")),
      };
    } else if (expression.startsWith("==") || expression.startsWith("=")) {
      return {
        operation: "eq",
        value: parseIntOrThrow(expression.replace(/=/g, "")),
      };
    } else if (expression) {
      return {
        operation: "eq",
        value: parseIntOrThrow(expression),
      };
    } else {
      return null;
    }
  } catch (error) {
    console.warn(error);
    return null;
  }
}

function matchNumericOperation(value: number, op: NumericOperation): boolean {
  if (op.operation === "eq") {
    if (value !== op.value) {
      return false;
    }
  } else if (op.operation === "gt") {
    if (!(value > op.value)) {
      return false;
    }
  } else if (op.operation === "gte") {
    if (!(value >= op.value)) {
      return false;
    }
  } else if (op.operation === "lt") {
    if (!(value < op.value)) {
      return false;
    }
  } else if (op.operation === "lte") {
    if (!(value <= op.value)) {
      return false;
    }
  } else {
    throw new Error(`Not implemented operation '${op.operation}'`);
  }
  return true;
}

function DocumentsTable({
  counts,
  documents,
  sort,
  sortReverse,
}: {
  counts: Counts;
  documents: Document[];
  sort: string;
  sortReverse: boolean;
}) {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);
  const filterTitle = searchParams.get("title") || "";
  const filterURL = searchParams.get("url") || "";
  const filterDifferences = searchParams.get("differences") || "";
  const filterDifferencesOperation = getNumericOperation(filterDifferences);

  function TableHead({ id, title }: { id: string; title: string }) {
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

      if (
        filterDifferencesOperation &&
        !matchNumericOperation(
          document.differences.total,
          filterDifferencesOperation
        )
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
      } else if (sort === "title") {
        const a = A.title;
        const b = B.title;
        return reverse * a.localeCompare(b);
      } else if (sort === "mdn_url") {
        const a = A.mdn_url;
        const b = B.mdn_url;
        return reverse * a.localeCompare(b);
      } else {
        throw new Error(`Unrecognized sort '${sort}'`);
      }
    });
  const pageCount = Math.ceil(counts.total / pageSize);

  return (
    <div className="documents">
      <h3>
        {counts.missing.toLocaleString()} missing translations (of{" "}
        {counts.total.toLocaleString()} possible)
      </h3>

      <table>
        <thead>
          <tr>
            <TableHead id="title" title="Document" />
            <TableHead id="popularity" title="Popularity" />
            <TableHead id="modified" title="Last modified" />
          </tr>
        </thead>
        <tbody>
          {filteredDocuments
            .slice((page - 1) * pageSize, page * pageSize)
            .map((doc: Document) => {
              return (
                <tr key={doc.mdn_url}>
                  <td>
                    <span className="document-title-preview">
                      {filterTitle ? (
                        <HighlightedText
                          text={doc.title}
                          highlight={filterTitle}
                        />
                      ) : (
                        doc.title
                      )}
                    </span>
                    <br />
                    <Link
                      to={`${doc.mdn_url}#_flaws`}
                      title={doc.title}
                      target="_blank"
                    >
                      <BriefURL uri={doc.mdn_url} filterURL={filterURL} />
                    </Link>
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
                  </td>
                  <td>
                    <LastModified edits={doc.edits} />
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>

      <Paginator last={pageCount} />
    </div>
  );
}

function LastModified({ edits }: { edits: DocumentEdits }) {
  const modified = dayjs(edits.modified);
  return (
    <span className="last_modified">
      <a href={edits.commitURL} target="_blank" rel="noreferrer">
        <time dateTime={modified.toISOString()} title={modified.toISOString()}>
          {modified.fromNow()}
        </time>
      </a>
    </span>
  );
}

function HighlightedText({
  text,
  highlight,
}: {
  text: string;
  highlight: string;
}) {
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

function BriefURL({ uri, filterURL }: { uri: string; filterURL: string }) {
  const [left, right] = uri.split(/\/docs\//, 2);
  return (
    <>
      <span className="url-prefix">{left}/docs/</span>
      <span className="url-slug">
        {filterURL ? (
          <HighlightedText text={right} highlight={filterURL} />
        ) : (
          right
        )}
      </span>
    </>
  );
}

// https://gist.github.com/jlbruno/1535691/db35b4f3af3dcbb42babc01541410f291a8e8fac
function getGetOrdinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n.toLocaleString() + (s[(v - 20) % 10] || s[v] || s[0]);
}
