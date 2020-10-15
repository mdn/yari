import React, { useEffect, useState } from "react";
// import { useTable, usePagination } from "react-table";
// import type types from "react-table";
import { Link } from "react-router-dom";
import useSWR from "swr";

import "./index.scss";

interface Document {
  mdn_url: string;
  modified: string;
  title: string;
  popularity: number;
  flaws: {
    [key: string]: string[];
  };
  normalizedMacrosCount: {
    [key: string]: number;
  };
}

interface MacroInfo {
  sourceName: string;
  normalizedName: string;
  totalCount: number;
}

type Metadata = {
  tookSeconds: number;
  count: number;
};

interface Data {
  documents: Document[];
  metadata: Metadata;
  allMacros: MacroInfo[];
}

export default function AllTraits() {
  const [startLoadingTime, setStartLoadingTime] = useState<Date | null>(null);
  const [endLoadingTime, setEndLoadingTime] = useState<Date | null>(null);
  useEffect(() => {
    document.title = "All Documents Traits";
  }, []);

  const { data, error } = useSWR<Data, Error>(
    "/_traits",
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
      revalidateOnFocus: false,
    }
  );

  useEffect(() => {
    if (!data && !error) {
      setStartLoadingTime(new Date());
    } else {
      setEndLoadingTime(new Date());
    }
  }, [data, error]);

  return (
    <div id="all-traits">
      <h1>All Documents Traits</h1>
      {data && (
        <p>Data loaded ({data.metadata.count.toLocaleString()} documents)</p>
      )}
      {data && <DisplayData data={data} />}
      {error && (
        <p>
          Error loading data: <code>{error.toString()}</code>
        </p>
      )}
      {startLoadingTime && endLoadingTime && (
        <Took
          milliseconds={endLoadingTime.getTime() - startLoadingTime.getTime()}
        />
      )}
      {!data && !error && startLoadingTime ? (
        <Loading startLoadingTime={startLoadingTime} />
      ) : null}
    </div>
  );
}

function Took({ milliseconds }: { milliseconds: number }) {
  const seconds = milliseconds / 1000;
  return (
    <p>
      <small>Took {seconds.toFixed(1)} seconds to load.</small>
    </p>
  );
}

function Loading({ startLoadingTime }: { startLoadingTime: Date }) {
  const [estimateEndTime, setEstimateEndTime] = useState(
    // 10 seconds
    new Date(startLoadingTime.getTime() + 1000 * 10)
  );
  useEffect(() => {
    if (sessionStorage.getItem(SESSIONSTORAGE_KEY)) {
      setEstimateEndTime(
        new Date(
          new Date().getTime() +
            parseInt(sessionStorage.getItem(SESSIONSTORAGE_KEY) as string)
        )
      );
    }

    return () => {
      const aliveTime = new Date().getTime() - startLoadingTime.getTime();
      // Store this for the next time for better estimates
      sessionStorage.setItem(SESSIONSTORAGE_KEY, `${aliveTime}`);
    };
  }, [startLoadingTime]);

  const INTERVAL_INCREMENT = 700;
  const SESSIONSTORAGE_KEY = "alltraits-loading-took";
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
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
        Estimated time to finish: {((distance - elapsed) / 1000).toFixed(0)}s
      </small>
    </div>
  );
}

function DisplayData({ data }: { data: Data }) {
  const macros = data.allMacros;
  const documents = data.documents;
  return (
    <div>
      <AllMacroUses macros={macros} documents={documents} />
    </div>
  );
}

function AllMacroUses({
  macros,
  documents,
}: {
  macros: MacroInfo[];
  documents: Document[];
}) {
  const [sortMacros, setSortMacros] = useState("alphabetically");
  const [filterMacros, setFilterMacros] = useState("");
  const [hideNeverused, setHideNeverused] = useState(false);

  const displayMacros = macros
    .sort((a, b) => {
      if (sortMacros === "popularity") {
        return b.totalCount - a.totalCount;
      } else if (sortMacros === "popularityReverse") {
        return a.totalCount - b.totalCount;
      }
      let reverse = sortMacros === "alphabeticallyReverse" ? -1 : 1;
      return reverse * a.normalizedName.localeCompare(b.normalizedName);
    })
    .filter((m) => {
      const search = filterMacros.trim().toLowerCase();
      if (hideNeverused && !m.totalCount) return false;
      return (
        !(search && search.length > 1) || m.normalizedName.includes(search)
      );
    });

  const [filterDocuments, setFilterDocuments] = useState("");
  const displayDocuments = documents
    .filter((d) => {
      const search = filterDocuments.trim().toLowerCase();
      return (
        !(search && search.length > 2) ||
        d.mdn_url.toLowerCase().includes(search)
      );
    })
    .slice(0, 25);

  return (
    <div className="all-macros-used">
      <h4>Every Macro Used</h4>
      <small>
        This is only the <i>immediate</i> uses of macros. A macro might call
        another macro inside itself, and never mentioned in a document.
      </small>
      <table>
        <thead>
          <tr>
            <th className="filter">
              <div className="filter-macros">
                <input
                  type="search"
                  placeholder="Filter macros"
                  value={filterMacros}
                  onChange={(event) => {
                    setFilterMacros(event.target.value);
                  }}
                />
                <br />
                <label htmlFor="id_sort_macros">Sort by:</label>
                <select
                  id="id_sort_macros"
                  value={sortMacros}
                  onChange={(event) => {
                    const { value } = event.target;
                    setSortMacros(value);
                  }}
                >
                  <option value="alphabetically">A-Z</option>
                  <option value="alphabeticallyReverse">Z-A</option>
                  <option value="popularity">Frequent</option>
                  <option value="popularityReverse">Rare</option>
                </select>
                <br />
                <label htmlFor="id_hide_neverused">Hide never-used</label>
                <input
                  type="checkbox"
                  checked={hideNeverused}
                  onChange={(event) => {
                    setHideNeverused(event.target.checked);
                  }}
                />
              </div>

              <div className="filter-documents">
                <input
                  type="search"
                  placeholder="Filter documents"
                  value={filterDocuments}
                  onChange={(event) => {
                    setFilterDocuments(event.target.value);
                  }}
                />
              </div>
            </th>
            {displayMacros.map((macro) => {
              return (
                <th
                  className="macro"
                  key={macro.normalizedName}
                  title={`Total count across ALL documents: ${macro.totalCount.toLocaleString()}`}
                >
                  <span className="name">{macro.sourceName}</span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {displayDocuments.map((document) => {
            return (
              <tr key={document.mdn_url}>
                <td className="mdn_url">
                  <Link to={document.mdn_url} title={`"${document.title}"`}>
                    {document.mdn_url.replace("/en-US/docs", "…")}
                  </Link>
                </td>
                {displayMacros.map((macro) => {
                  const count =
                    document.normalizedMacrosCount[macro.normalizedName] || 0;
                  return (
                    <td
                      className="count"
                      key={macro.normalizedName}
                      title={macro.sourceName}
                    >
                      {count ? (
                        <b>{count}</b>
                      ) : (
                        <span className="zero">{count}</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// function DisplayData({ documents }: { documents: Document[] }) {
//   const columns: types.Column<Document>[] = useMemo(
//     () => [
//       {
//         Header: "Title",
//         accessor: "title",
//       },
//       {
//         Header: "URL",
//         accessor: "mdn_url",
//       },
//     ],
//     []
//   );
//   const tableInstance = useTable({ columns, data: documents }, usePagination);

//   const {
//     getTableProps,
//     getTableBodyProps,
//     headerGroups,
//     prepareRow,
//     page,

//     // Pagination related
//     canPreviousPage,
//     // canNextPage,
//     // pageOptions,
//     // pageCount,
//     // gotoPage,
//     // nextPage,
//     // previousPage,
//     // setPageSize,
//     // state: { pageIndex, pageSize },
//   } = tableInstance;

//   console.log(tableInstance);

//   const pageIndex = 0;
//   const pageOptions = [];
//   // const canPreviousPage = false;
//   const canNextPage = true;

//   return (
//     <div className="show-data">
//       <table {...getTableProps()}>
//         <thead>
//           {
//             // Loop over the header rows
//             headerGroups.map((headerGroup) => (
//               // Apply the header row props
//               <tr {...headerGroup.getHeaderGroupProps()}>
//                 {
//                   // Loop over the headers in each row
//                   headerGroup.headers.map((column) => (
//                     // Apply the header cell props
//                     <th {...column.getHeaderProps()}>
//                       {
//                         // Render the header
//                         column.render("Header")
//                       }
//                     </th>
//                   ))
//                 }
//               </tr>
//             ))
//           }
//         </thead>

//         {/* Apply the table body props */}
//         <tbody {...getTableBodyProps()}>
//           {
//             // Loop over the table rows
//             page.map((row) => {
//               // Prepare the row for display
//               prepareRow(row);
//               return (
//                 // Apply the row props
//                 <tr {...row.getRowProps()}>
//                   {
//                     // Loop over the rows cells
//                     row.cells.map((cell) => {
//                       // Apply the cell props
//                       return (
//                         <td {...cell.getCellProps()}>
//                           {
//                             // Render the cell contents
//                             cell.render("Cell")
//                           }
//                         </td>
//                       );
//                     })
//                   }
//                 </tr>
//               );
//             })
//           }
//         </tbody>
//       </table>
//       <div className="pagination">
//         <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
//           {"<<"}
//         </button>{" "}
//         <button onClick={() => previousPage()} disabled={!canPreviousPage}>
//           {"<"}
//         </button>{" "}
//         <button onClick={() => nextPage()} disabled={!canNextPage}>
//           {">"}
//         </button>{" "}
//         <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
//           {">>"}
//         </button>{" "}
//         <span>
//           Page{" "}
//           <strong>
//             {pageIndex + 1} of {pageOptions.length}
//           </strong>{" "}
//         </span>
//       </div>
//     </div>
//   );
// }
