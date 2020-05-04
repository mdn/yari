import React, { useCallback, useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import useSWR from "swr";

import "./index.scss";

import { humanizeFlawName } from "../flaw-utils";

// XXX This component should also import DocumentSpy so that it can
// know to automatically refresh when there's new document edits
// because their flaws might have changed.

interface Counts {
  found: number;
  possible: number;
  built: number;
}

interface Data {
  counts: Counts;
  documents: any[];
}

interface Filter {
  mdn_url: string;
  popularity: string;
  flaws: string[];
}

export default function AllFlaws() {
  const { locale } = useParams();
  const [lastData, setLastData] = useState<Data | null>(null);

  const [filters, setFilters] = useState<Filter>({
    mdn_url: "",
    popularity: "",
    flaws: [],
  });

  const [sortBy, setSortBy] = useState<string>("popularity");
  const [sortReverse, setSortReverse] = useState<boolean>(false);

  function updateFilters(newFilters) {
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
    return `/_flaws?${params.toString()}`;
  }, [locale, filters, sortBy, sortReverse]);

  const { data, error, isValidating } = useSWR(
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
      <h1>Find all flaws </h1>
      {loading}
      {error && <ShowSearchError error={error} />}
      <form onSubmit={submitHandler}></form>
      {lastData && (
        <ShowDocumentsFound
          counts={lastData.counts}
          documents={lastData.documents}
          initialFilters={filters}
          updateFilters={updateFilters}
          sortBy={sortBy}
          sortReverse={sortReverse}
          setSort={setSort}
        />
      )}
      {data && <ShowTimes times={data.times} />}
    </div>
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

interface Times {
  built: number;
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

function ShowDocumentsFound({
  counts,
  documents,
  initialFilters,
  updateFilters,
  sortBy,
  sortReverse,
  setSort,
}: {
  counts: Counts;
  documents: any;
  initialFilters: Filter;
  updateFilters: Function;
  sortBy: string;
  sortReverse: boolean;
  setSort: Function;
}) {
  const [filters, setFilters] = useState(initialFilters);

  function refreshFilters() {
    updateFilters(filters);
  }

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

  return (
    <div className="documents-found">
      <h3>Documents with flaws found ({counts.found})</h3>
      {!counts.built ? (
        <WarnAboutNothingBuilt />
      ) : (
        <h4>
          {counts.built.toLocaleString()} built documents out of a possible{" "}
          {counts.possible.toLocaleString()}
        </h4>
      )}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          console.log("SUBMIT!");

          refreshFilters();
        }}
      >
        <table>
          <thead>
            <tr>
              <th onClick={() => setSort("mdn_url")}>
                Document
                {sortBy === "mdn_url" ? (sortReverse ? "🔽" : "🔼") : null}
              </th>
              <th onClick={() => setSort("popularity")}>
                Popularity ranking
                {sortBy === "popularity" ? (sortReverse ? "🔽" : "🔼") : null}
              </th>
              <th onClick={() => setSort("flaws")}>Flaws</th>
            </tr>
          </thead>
          <thead>
            <tr>
              <th>
                <input
                  type="search"
                  placeholder="Filter by document URI"
                  value={filters.mdn_url}
                  onChange={(event) => {
                    setFilters({ ...filters, mdn_url: event.target.value });
                  }}
                  onBlur={refreshFilters}
                />
              </th>
              <th>
                <input
                  type="search"
                  placeholder="E.g. < 100"
                  value={filters.popularity || ""}
                  onChange={(event) => {
                    setFilters({ ...filters, popularity: event.target.value });
                  }}
                  onBlur={refreshFilters}
                />
              </th>
              <th>
                <select
                  multiple
                  value={filters.flaws || []}
                  onChange={(event) => {
                    setFilters({ ...filters, flaws: [event.target.value] });
                  }}
                >
                  <option value="broken_links">
                    {humanizeFlawName("broken_links")}
                  </option>
                </select>
              </th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => {
              return (
                <tr key={doc.mdn_url}>
                  <td>
                    <Link to={`${doc.mdn_url}#show-flaws`} title={doc.title}>
                      {doc.mdn_url}
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
                      : `${getGetOrdinal(doc.popularity.ranking)}`}
                  </td>
                  <td>{summarizeFlaws(doc.flaws)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </form>
      <pre>{JSON.stringify(filters)}</pre>
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
