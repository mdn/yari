import React, { useEffect, useMemo, useState } from "react";
import { useTable, usePagination } from "react-table";
import type types from "react-table";
// import { Link } from "react-router-dom";
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
}

type Metadata = {
  tookSeconds: number;
  count: number;
};

interface Data {
  documents: Document[];
  metadata: Metadata;
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
      {data && <DisplayData documents={data.documents} />}
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

function DisplayData({ documents }: { documents: Document[] }) {
  const columns: types.Column<Document>[] = useMemo(
    () => [
      {
        Header: "Title",
        accessor: "title",
      },
      {
        Header: "URL",
        accessor: "mdn_url",
      },
    ],
    []
  );
  const tableInstance = useTable({ columns, data: documents }, usePagination);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,

    // Pagination related
    canPreviousPage,
    // canNextPage,
    // pageOptions,
    // pageCount,
    // gotoPage,
    // nextPage,
    // previousPage,
    // setPageSize,
    // state: { pageIndex, pageSize },
  } = tableInstance;

  console.log(tableInstance);

  const pageIndex = 0;
  const pageOptions = [];
  // const canPreviousPage = false;
  const canNextPage = true;

  return (
    <div className="show-data">
      <table {...getTableProps()}>
        <thead>
          {
            // Loop over the header rows
            headerGroups.map((headerGroup) => (
              // Apply the header row props
              <tr {...headerGroup.getHeaderGroupProps()}>
                {
                  // Loop over the headers in each row
                  headerGroup.headers.map((column) => (
                    // Apply the header cell props
                    <th {...column.getHeaderProps()}>
                      {
                        // Render the header
                        column.render("Header")
                      }
                    </th>
                  ))
                }
              </tr>
            ))
          }
        </thead>

        {/* Apply the table body props */}
        <tbody {...getTableBodyProps()}>
          {
            // Loop over the table rows
            page.map((row) => {
              // Prepare the row for display
              prepareRow(row);
              return (
                // Apply the row props
                <tr {...row.getRowProps()}>
                  {
                    // Loop over the rows cells
                    row.cells.map((cell) => {
                      // Apply the cell props
                      return (
                        <td {...cell.getCellProps()}>
                          {
                            // Render the cell contents
                            cell.render("Cell")
                          }
                        </td>
                      );
                    })
                  }
                </tr>
              );
            })
          }
        </tbody>
      </table>
      <div className="pagination">
        <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
          {"<<"}
        </button>{" "}
        <button onClick={() => previousPage()} disabled={!canPreviousPage}>
          {"<"}
        </button>{" "}
        <button onClick={() => nextPage()} disabled={!canNextPage}>
          {">"}
        </button>{" "}
        <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
          {">>"}
        </button>{" "}
        <span>
          Page{" "}
          <strong>
            {pageIndex + 1} of {pageOptions.length}
          </strong>{" "}
        </span>
      </div>
    </div>
  );
}
