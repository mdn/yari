import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  createSearchParams,
  Link,
  useParams,
  useSearchParams,
} from "react-router-dom";
import useSWR from "swr";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
// import "dayjs/locale/fr";

import "./index.scss";

// import { humanizeFlawName } from "../flaw-utils";
import { PageContentContainer } from "../ui/atoms/page-content";

dayjs.extend(relativeTime);

interface DocumentPopularity {
  value: number;
  ranking: number;
  parentValue: number;
  parentRanking: number;
}

// interface DocumentFlaws {
//   name: string;
//   value: number | string;
//   countFixable: number;
// }

// interface DocumentDate {
//   modified: string;
//   parentModified: string;
//   differenceMS: number;
// }

interface DocumentDifferences {
  count: number;
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

type Count = { [key: string]: number };

interface FlawsCounts {
  total: number;
  fixable: number;
  type: Count;
  macros: Count;
}

interface Counts {
  found: number;
  total: number;
  pages: number;
  noParents: number;
  cacheMisses: number;
  // flaws: FlawsCounts;
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

interface Filters {
  mdn_url: string;
  title: string;
  popularity: string;
  fixableFlaws: string;
  flaws: string[];
  page: number;
  sort_by: string;
  sort_reverse: boolean;
  search_flaws: string[];
}

const defaultFilters: Filters = Object.freeze({
  mdn_url: "",
  title: "",
  popularity: "",
  fixableFlaws: "",
  flaws: [],
  page: 1,
  sort_by: "popularity",
  sort_reverse: false,
  search_flaws: [],
});

function withoutDefaultFilters(filters: Filters): Partial<Filters> {
  return Object.fromEntries(
    Object.entries(filters).filter(
      ([key, value]) =>
        JSON.stringify(defaultFilters[key]) !== JSON.stringify(value)
    )
  );
}

/**
 * Returns an array where
 * first element is the currently set (or default) filters
 * second element is a function to update a given set of partial filters.
 * NOTE: This only changes the given filters, and doesn't reset what is missing
 */
function useFiltersURL(): [Filters, (filters: Partial<Filters>) => void] {
  const [searchParams, setSearchParams] = useSearchParams();

  function groupParamsByKey(params: URLSearchParams): any {
    return [...params.entries()].reduce((acc, tuple) => {
      // getting the key and value from each tuple
      const [key, val] = tuple;
      if (Object.prototype.hasOwnProperty.call(acc, key)) {
        // if the current key is already an array, we'll add the value to it
        if (Array.isArray(acc[key])) {
          acc[key] = [...acc[key], val];
        } else {
          // if it's not an array, but contains a value, we'll convert it into an array
          // and add the current value to it
          acc[key] = [acc[key], val];
        }
      } else {
        // plain assignment if no special case is present
        acc[key] = val;
      }
      return acc;
    }, {});
  }

  const filters = useMemo(() => {
    const searchParamsObject = groupParamsByKey(searchParams);
    if (searchParamsObject.page) {
      searchParamsObject.page = parseInt(searchParamsObject.page);
    }
    return { ...defaultFilters, ...searchParamsObject };
  }, [searchParams]);

  const updateFiltersURL = useCallback(
    (partialFilters: Partial<Filters>) => {
      const newSearchParams = withoutDefaultFilters({
        ...filters,
        ...partialFilters,
      }) as Record<string, string | string[]>;
      setSearchParams(newSearchParams);
    },
    [filters, setSearchParams]
  );

  // const mustBeArrayKeys = ["flaws", "search_flaws"];
  // for (const key of mustBeArrayKeys) {
  //   if (filters[key] && !Array.isArray(filters[key])) {
  //     filters[key] = [filters[key]];
  //   }
  // }

  return [filters, updateFiltersURL];
}

export default function AllTranslations() {
  const { locale } = useParams();

  const [lastData, setLastData] = useState<Data | null>(null);

  useEffect(() => {
    let title = "All translations";
    if (locale.toLowerCase() !== "en-us") {
      title += ` for ${locale}`;
    }
    if (lastData) {
      title = `(${lastData.counts.found.toLocaleString()} found) ${title}`;
    }
    document.title = title;
  }, [lastData, locale]);

  const getAPIUrl = useCallback(() => {
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

  useEffect(() => {
    if (data) {
      setLastData(data);
    }
  }, [data]);

  // console.log({
  //   error,
  //   isValidating,
  //   hasData: !!data,
  //   hasLastData: !!lastData,
  // });

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

  return (
    <Container>
      {lastData && !error && isValidating && (
        <p style={{ float: "right" }}>Reloading...</p>
      )}
      {!data && !error && !lastData && (
        <Loading
          estimate={10 * 1000}
          onComplete={(ms: number) => {
            // console.log("Lets remember it took", ms);
            // console.log(data);
          }}
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
      <h2>Have to pick a locale</h2>
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

function Loading({
  estimate,
  onComplete,
}: {
  estimate: number;
  onComplete?: (ms: number) => void;
}) {
  const startLoadingTime = new Date();
  const [estimateEndTime, setEstimateEndTime] = React.useState(
    new Date(startLoadingTime.getTime() + estimate)
  );

  React.useEffect(() => {
    // Unmount means the loading ended
    return () => {
      if (onComplete) {
        onComplete(new Date().getTime() - startLoadingTime.getTime());
      }
    };
  }, []);

  // React.useEffect(() => {
  //   if (localStorage.getItem(LOCALSTORAGE_KEY)) {
  //     setEstimateEndTime(
  //       new Date(
  //         new Date().getTime() +
  //           parseInt(localStorage.getItem(LOCALSTORAGE_KEY) as string)
  //       )
  //     );
  //   }

  //   return () => {
  //     // Store this for the next time for better estimates
  //     const aliveTime = new Date().getTime() - startLoadingTime.getTime();
  //     // If the time it took was tiny it was because it was cached.
  //     if (aliveTime > 1000) {
  //       localStorage.setItem(LOCALSTORAGE_KEY, `${aliveTime}`);
  //     }
  //   };
  // }, [startLoadingTime]);

  const INTERVAL_INCREMENT = 700;
  // const LOCALSTORAGE_KEY = "alltraits-loading-took";
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

interface SearchFlawRow {
  flaw: string;
  search: string;
}

function serializeSearchFlaws(rows: SearchFlawRow[]) {
  return rows.map((row) => `${row.flaw}:${row.search}`);
}

function deserializeSearchFlaws(list: string[]) {
  const rows: SearchFlawRow[] = [];
  for (const row of list) {
    const [flaw, search] = row.split(":", 2);
    rows.push({ flaw, search });
  }
  return rows;
}

function FilterControls() {
  const [searchParams, setSearchParams] = useSearchParams();
  // const filterTitle = searchParams.get("title") || "";
  // const filterURL = searchParams.get("url") || "";
  const [title, setTitle] = React.useState(searchParams.get("title") || "");
  const [url, setURL] = React.useState(searchParams.get("url") || "");

  function refreshFilters() {
    const create = createSearchParams(searchParams);

    // const params: { [key: string]: string } = {};
    for (const [key, value] of [
      ["url", url],
      ["title", title],
    ]) {
      if (value) {
        console.log("SET", key);
        create.set(key, value);
      } else {
        create.delete(key);
      }
    }
    console.log({ create: create.toString() });
    setSearchParams(create);
    // const searchParams = createSearchParams(params);
    // console.log({ title, url, searchParams: searchParams.toString() });
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
            onBlur={refreshFilters}
          />
          <input
            type="search"
            placeholder="Filter by document title"
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
            }}
            // onBlur={refreshFilters}
          />
        </div>

        <div>
          <h4>Popularity</h4>
          {/* <input
            type="search"
            placeholder="E.g. < 100"
            value={filters.popularity || ""}
            onChange={(event) => {
              setFilters({ ...filters, popularity: event.target.value });
            }}
            onBlur={refreshFilters}
          /> */}
        </div>

        <div>
          <h4>Search differences</h4>
          <input
            type="search"
            placeholder="E.g. >0"
            // value={filters.fixableFlaws || ""}
            // onChange={(event) => {
            //   setFilters({ ...filters, fixableFlaws: event.target.value });
            // }}
            // onBlur={refreshFilters}
          />
        </div>

        <div>
          <h4>&nbsp;</h4>
          <button type="submit">Filter now</button>
          {/* {hasFilters && (
            <button type="button" onClick={resetFilters}>
              Reset filters
            </button>
          )} */}
        </div>
      </form>
    </div>
  );
}
// function FilterControls() {
//   const [initialFilters, updateFiltersURL] = useFiltersURL();
//   console.log(initialFilters);

//   const [filters, setFilters] = useState(initialFilters);
//   const [searchFlawsRows, setSearchFlawsRows] = useState<SearchFlawRow[]>(
//     deserializeSearchFlaws(initialFilters.search_flaws)
//   );

//   useEffect(() => {
//     // A little convenience DOM trick to put focus on the search input
//     // after you've added a row or used the <select>
//     const searchInputs = [
//       ...document.querySelectorAll<HTMLInputElement>(
//         'ul.search-flaws-rows input[type="search"]'
//       ),
//     ].filter((input) => !input.value);
//     if (searchInputs.length) {
//       searchInputs[searchInputs.length - 1].focus();
//     }
//   }, [searchFlawsRows]);

//   function refreshFilters() {
//     updateFiltersURL(filters);
//   }

//   let hasFilters = !equalObjects(defaultFilters, filters);

//   let hasEmptySearchFlawsRow = searchFlawsRows.some(
//     (row) => !row.search.trim()
//   );

//   function resetFilters(event: React.MouseEvent) {
//     event.preventDefault();
//     setFilters(defaultFilters);
//     updateFiltersURL(defaultFilters);
//   }

//   return (
//     <div className="filters">
//       <h3>Filters</h3>
//       <form
//         onSubmit={(event) => {
//           event.preventDefault();
//           refreshFilters();
//         }}
//       >
//         <div>
//           <h4>Document</h4>
//           <input
//             type="search"
//             placeholder="Filter by document URI"
//             value={filters.mdn_url}
//             onChange={(event) => {
//               setFilters({ ...filters, mdn_url: event.target.value });
//             }}
//             onBlur={refreshFilters}
//           />
//           <input
//             type="search"
//             placeholder="Filter by document title"
//             value={filters.title}
//             onChange={(event) => {
//               setFilters({ ...filters, title: event.target.value });
//             }}
//             onBlur={refreshFilters}
//           />
//         </div>

//         <div>
//           <h4>Popularity</h4>
//           <input
//             type="search"
//             placeholder="E.g. < 100"
//             value={filters.popularity || ""}
//             onChange={(event) => {
//               setFilters({ ...filters, popularity: event.target.value });
//             }}
//             onBlur={refreshFilters}
//           />
//         </div>
//         <div>
//           <h4>Fixable flaws</h4>
//           <input
//             type="search"
//             placeholder="E.g. >0"
//             value={filters.fixableFlaws || ""}
//             onChange={(event) => {
//               setFilters({ ...filters, fixableFlaws: event.target.value });
//             }}
//             onBlur={refreshFilters}
//           />
//         </div>

//         <div>
//           <h4>&nbsp;</h4>
//           <button type="submit">Filter now</button>
//           {hasFilters && (
//             <button type="button" onClick={resetFilters}>
//               Reset filters
//             </button>
//           )}
//         </div>
//       </form>
//     </div>
//   );
// }

// function equalObjects(obj1: object, obj2: object) {
//   const keys1 = new Set(Object.keys(obj1));
//   const keys2 = new Set(Object.keys(obj2));
//   if (keys1.size !== keys2.size) {
//     return false;
//   }
//   for (const key of keys1) {
//     if (!keys2.has(key)) {
//       return false;
//     }
//   }

//   return Object.entries(obj1).every(([key, value]) => {
//     const value2 = obj2[key];
//     if (typeof value !== typeof value2) {
//       return false;
//     }
//     if (Array.isArray(value)) {
//       return (
//         value.length === value2.length && value.every((v, i) => v === value2[i])
//       );
//     } else {
//       return value === value2;
//     }
//   });
// }

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

  // function summarizeFlaws(flaws: DocumentFlaws[]) {
  //   // Return a one-liner about all the flaws
  //   const totalCountFixable = flaws.reduce(
  //     (acc, flaw) => flaw.countFixable + acc,
  //     0
  //   );
  //   const bits = flaws.map((flaw) => {
  //     return `${humanizeFlawName(flaw.name)}: ${flaw.value}`;
  //   });
  //   return `${bits.join(", ")} (${totalCountFixable} fixable)`;
  // }

  function TH({ id, title }: { id: string; title: string }) {
    return (
      <th
        onClick={() => {
          if (sort === id) {
            // searchParams.set("sortReverse", JSON.stringify(!sortReverse));
            setSearchParams(
              createSearchParams({
                sort: id,
                sortReverse: JSON.stringify(!sortReverse),
              })
            );
          } else {
            // searchParams.set("sort", id);
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
                  <td>
                    {doc.differences.count ? (
                      <>
                        {doc.differences.count.toLocaleString()}{" "}
                        <small>
                          ({doc.differences.total.toLocaleString()} total)
                        </small>
                      </>
                    ) : (
                      "0"
                    )}
                  </td>
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
  const [filters] = useFiltersURL();
  // Unfortunately TS's Partial<T> is not quite the right return type of this function,
  // as it implies the object could have keys set to undefined, which isn't true here.
  // Hence we have to use type coercion (any)
  const newFilters = withoutDefaultFilters({ ...filters, page: number }) as any;
  if (newFilters.page) {
    newFilters.page = String(newFilters.page);
  }
  return (
    <Link
      to={"?" + createSearchParams(newFilters).toString()}
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

// function WarnAboutNothingBuilt() {
//   return (
//     <div className="attention document-warnings">
//       <h4>No documents have been built, so no flaws can be found</h4>
//       <p>
//         At the moment, you have to use the command line tools to build documents
//         that we can analyze.
//       </p>
//     </div>
//   );
// }
