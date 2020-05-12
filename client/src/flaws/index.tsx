import React, { useCallback, useState, useEffect } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import useSWR from "swr";

import "./index.scss";

import { humanizeFlawName } from "../flaw-utils";

// XXX This component should also import DocumentSpy so that it can
// know to automatically refresh when there's new document edits
// because their flaws might have changed.

interface DocumentPopularity {
  value: number;
  ranking: number;
}

interface Document {
  mdn_url: string;
  modified: string;
  popularity: DocumentPopularity;
  folder: string;
  flaws: {
    [key: string]: string[];
  };
}

interface Counts {
  found: number;
  possible: number;
  built: number;
  pages: number;
}

interface Times {
  built: number;
}

interface FlawLevel {
  name: string;
  level: string;
  ignored: boolean;
}

interface Data {
  counts: Counts;
  documents: Document[];
  times: Times;
  flawLevels: FlawLevel[];
}

interface Filter {
  mdn_url: string;
  popularity: string;
  flaws: string[];
}

const defaultFilter = {
  mdn_url: "",
  popularity: "",
  flaws: [],
};

function deserializeFilters(qs: string): Filter {
  const filters = Object.assign({}, defaultFilter);
  const sp = new URLSearchParams(qs);
  for (const [key, value] of sp) {
    if (filters.hasOwnProperty(key)) {
      if (Array.isArray(filters[key])) {
        filters[key] = sp.getAll(key);
      } else {
        filters[key] = value;
      }
    }
  }
  return filters;
}

function deserializePagination(qs: string): number {
  const sp = new URLSearchParams(qs);
  if (sp.get("page")) {
    try {
      const page = parseInt(sp.get("page") || "1");
      if (page >= 1) {
        return page;
      }
    } catch (err) {
      console.warn(`Invalid page '${sp.get("page")}'`);
    }
  }
  return 1;
}

function serializeFiltersAndPagination(
  previousQs: string,
  filters: Filter,
  page: number
): string {
  const sp = new URLSearchParams(previousQs);
  Object.keys(defaultFilter).forEach((key) => {
    sp.delete(key);
  });
  Object.entries(filters).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      for (const v of value) {
        sp.append(key, v);
      }
    } else if (value) {
      sp.set(key, value);
    }
  });
  if (page === 1) {
    if (sp.has("page")) {
      sp.delete("page");
    }
  } else {
    sp.set("page", `${page}`);
  }
  const spString = sp.toString();
  if (spString) {
    return `?${spString}`;
  }
  return "";
}

export default function AllFlaws() {
  const navigate = useNavigate();
  const { locale } = useParams();
  const [lastData, setLastData] = useState<Data | null>(null);

  const location = useLocation();
  const [page, setPage] = useState<number>(
    deserializePagination(location.search)
  );
  const [filters, setFilters] = useState<Filter>(
    deserializeFilters(location.search)
  );

  useEffect(() => {
    let title = "Find all flaws";
    if (lastData) {
      title = `(${lastData.counts.found.toLocaleString()} found) ${title}`;
    }
    document.title = title;
  }, [lastData]);

  const [sortBy, setSortBy] = useState<string>("popularity");
  const [sortReverse, setSortReverse] = useState<boolean>(false);

  useEffect(() => {
    navigate(serializeFiltersAndPagination(location.search, filters, page));
  }, [filters, location.search, navigate, page]);

  function updateFilters(newFilters: Filter) {
    setPage(1);
    setFilters(Object.assign({}, newFilters));
  }

  const getAPIUrl = useCallback(() => {
    const params = new URLSearchParams();
    params.set("locale", locale);
    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        for (const v of value) {
          params.append(key, v);
        }
      } else {
        params.set(key, value);
      }
    });
    params.set("sort", sortBy);
    params.set("reverse", JSON.stringify(sortReverse));
    if (page > 1) {
      params.set("page", `${page}`);
    }
    return `/_flaws?${params.toString()}`;
  }, [locale, filters, sortBy, sortReverse, page]);

  const { data, error, isValidating } = useSWR<Data, Error>(
    getAPIUrl(),
    async (url) => {
      let response;
      try {
        response = await fetch(url);
      } catch (ex) {
        throw ex;
      }
      if (!response.ok) {
        throw new Error(`${response.status} on ${url}`);
      }
      if (!response.headers.get("content-type").includes("application/json")) {
        throw new Error(
          `Response is not JSON (${response.headers.get("content-type")})`
        );
      }
      // Always return a promise!
      return response.json();
    },
    {
      // revalidateOnFocus: false
    }
  );

  useEffect(() => {
    if (data) {
      setLastData(data);
    }
  }, [data]);

  function setSort(key: string): void {
    if (sortBy === key) {
      setSortReverse(!sortReverse);
    } else {
      setSortBy(key);
    }
  }

  function submitHandler(event) {
    event.preventDefault();
  }

  // XXX there's something weird about this logic
  let loading: React.ReactNode = <small>&nbsp;</small>;
  if (!data && !error) {
    if (lastData) {
      loading = <small>Reloading...</small>;
    } else {
      loading = <small>Loading...</small>;
    }
  } else if (isValidating) {
    loading = <small>Reloading...</small>;
  }

  return (
    <div id="all-flaws">
      <h1>Find all flaws</h1>
      {loading}
      {error && <ShowSearchError error={error} />}
      <form onSubmit={submitHandler}></form>
      {lastData && (
        <div className="filter-documents">
          <ShowFilters
            initialFilters={filters}
            updateFilters={updateFilters}
            flawLevels={lastData.flawLevels}
          />
          <ShowDocumentsFound
            locale={locale}
            page={page}
            counts={lastData.counts}
            documents={lastData.documents}
            sortBy={sortBy}
            sortReverse={sortReverse}
            setSort={setSort}
          />
          <Pagination
            page={page}
            setPage={setPage}
            filters={filters}
            pages={lastData.counts.pages}
          />
        </div>
      )}
      {data && <ShowTimes times={data.times} />}
    </div>
  );
}

function Pagination({
  page,
  setPage,
  filters,
  pages,
}: {
  page: number;
  setPage: Function;
  filters: Filter;
  pages: number;
}) {
  const location = useLocation();

  if (pages < 2) {
    return null;
  }

  return (
    <p className="pagination">
      {page > 1 ? (
        <Link
          to={serializeFiltersAndPagination(location.search, filters, page - 1)}
          onClick={() => {
            setPage(page - 1);
          }}
        >
          Previous page ({page - 1})
        </Link>
      ) : (
        <a href={window.location.href} className="disabled">
          Previous page
        </a>
      )}{" "}
      {page + 1 <= pages ? (
        <Link
          to={serializeFiltersAndPagination(location.search, filters, page + 1)}
          onClick={() => {
            setPage(page + 1);
          }}
        >
          Next page ({page + 1})
        </Link>
      ) : (
        <a href={window.location.href} className="disabled">
          Next page
        </a>
      )}
    </p>
  );
}

function ShowSearchError({ error }) {
  return (
    <div className="attention search-error">
      <h3>Search error</h3>
      <pre>{error.toString()}</pre>
    </div>
  );
}

function ShowTimes({ times }: { times: Times }) {
  function format(ms: number) {
    if (ms > 1000) {
      const s = ms / 1000;
      return `${s.toFixed(1)} seconds`;
    } else {
      return `${Math.trunc(ms)} milliseconds`;
    }
  }
  const bits = [
    // `possible documents: ${format(times.possible)}`,
    `built documents: ${format(times.built)}`,
  ];
  return (
    <div className="search-times">
      <p>Time to find... {bits.join(", ")}</p>
    </div>
  );
}

function ShowFilters({
  initialFilters,
  updateFilters,
  flawLevels,
}: {
  initialFilters: Filter;
  updateFilters: Function;
  flawLevels: FlawLevel[];
}) {
  const [filters, setFilters] = useState(initialFilters);

  function refreshFilters() {
    updateFilters(filters);
  }

  let hasFilters = !equalObjects(defaultFilter, filters);

  function resetFilters(event: React.MouseEvent) {
    event.preventDefault();
    const newFilters = Object.assign({}, defaultFilter);
    setFilters(newFilters);
    updateFilters(newFilters);
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
          <h4>Document URL</h4>
          <input
            type="search"
            placeholder="Filter by document URI"
            value={filters.mdn_url}
            onChange={(event) => {
              setFilters({ ...filters, mdn_url: event.target.value });
            }}
            onBlur={refreshFilters}
          />
        </div>

        <div>
          <h4>Popularity</h4>
          <input
            type="search"
            placeholder="E.g. < 100"
            value={filters.popularity || ""}
            onChange={(event) => {
              setFilters({ ...filters, popularity: event.target.value });
            }}
            onBlur={refreshFilters}
          />
        </div>
        <div>
          <h4>Flaws</h4>
          <select
            multiple={true}
            value={filters.flaws}
            onChange={(event) => {
              const flaws = [...event.target.selectedOptions].map(
                (opt) => opt.value
              );
              setFilters({ ...filters, flaws });
            }}
          >
            {flawLevels &&
              flawLevels.map((flawLevel) => {
                return (
                  <option key={flawLevel.name} value={flawLevel.name}>
                    {humanizeFlawName(flawLevel.name)}{" "}
                    {flawLevel.ignored && "(ignored)"}
                  </option>
                );
              })}
          </select>
        </div>

        <div>
          <h4>&nbsp;</h4>
          <button type="submit">Filter now</button>
          {hasFilters && (
            <button type="button" onClick={resetFilters}>
              Reset filters
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function equalObjects(obj1: object, obj2: object) {
  const keys1 = new Set(Object.keys(obj1));
  const keys2 = new Set(Object.keys(obj2));
  if (keys1.size !== keys2.size) {
    return false;
  }
  for (const key of keys1) {
    if (!keys2.has(key)) {
      return false;
    }
  }

  return Object.entries(obj1).every(([key, value]) => {
    const value2 = obj2[key];
    if (typeof value !== typeof value2) {
      return false;
    }
    if (Array.isArray(value)) {
      return (
        value.length === value2.length && value.every((v, i) => v === value2[i])
      );
    } else {
      return value === value2;
    }
  });
}

function ShowDocumentsFound({
  locale,
  page,
  counts,
  documents,
  sortBy,
  sortReverse,
  setSort,
}: {
  locale: string;
  page: number;
  counts: Counts;
  documents: any;
  sortBy: string;
  sortReverse: boolean;
  setSort: Function;
}) {
  // https://gist.github.com/jlbruno/1535691/db35b4f3af3dcbb42babc01541410f291a8e8fac
  function getGetOrdinal(n: number) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n.toLocaleString() + (s[(v - 20) % 10] || s[v] || s[0]);
  }

  function summarizeFlaws(flaws) {
    // Return a one-liner about all the flaws
    const bits = flaws.map((flaw) => {
      return `${humanizeFlawName(flaw.name)}: ${flaw.value}`;
    });
    return bits.join(", ");
  }

  function TH({ id, title }: { id: string; title: string }) {
    return (
      <th onClick={() => setSort(id)} className="sortable">
        {title} {sortBy === id ? (sortReverse ? "🔽" : "🔼") : null}
      </th>
    );
  }

  function showBriefURL(uri: string) {
    const [left, right] = uri.split(/\/docs\//, 2);
    return (
      <>
        <span className="url-prefix">{left}/docs/</span>
        <span className="url-slug">{right}</span>
      </>
    );
  }

  return (
    <div className="documents">
      <h3>
        Documents with flaws found ({counts.found.toLocaleString()}){" "}
        {page > 1 && <span className="page">page {page}</span>}
      </h3>
      {!counts.built ? (
        <WarnAboutNothingBuilt />
      ) : (
        <h4>
          {counts.built.toLocaleString()} built documents out of a possible{" "}
          {counts.possible.toLocaleString()} ({locale})
        </h4>
      )}

      <table>
        <thead>
          <tr>
            <TH id="mdn_url" title="Document" />
            <TH id="popularity" title="Popularity" />
            <TH id="flaws" title="Flaws" />
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => {
            return (
              <tr key={doc.mdn_url}>
                <td>
                  <Link to={`${doc.mdn_url}#show-flaws`} title={doc.title}>
                    {showBriefURL(doc.mdn_url)}
                  </Link>
                  <span className="document-title-preview">{doc.title}</span>
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
                    : `${getGetOrdinal(doc.popularity.ranking)}`}
                </td>
                <td>{summarizeFlaws(doc.flaws)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function WarnAboutNothingBuilt() {
  return (
    <div className="attention document-warnings">
      <h4>No documents have been built, so no flaws can be found</h4>
      <p>
        At the moment, you have to use the command line tools to build documents
        that we can analyze.
      </p>
    </div>
  );
}
