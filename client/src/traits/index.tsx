import React, { useEffect, useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import useSWR from "swr";

import { SQLTable } from "./sql-table";
import { AllMacroUses } from "./all-macros";
import { Data } from "./types";
import "./index.scss";

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
    <div className="all-traits">
      <h2>All Documents Traits</h2>
      {data && (
        <p>
          {data.metadata.count.toLocaleString()} documents loaded.{" "}
          {startLoadingTime && endLoadingTime && (
            <Took
              milliseconds={
                endLoadingTime.getTime() - startLoadingTime.getTime()
              }
            />
          )}
        </p>
      )}
      {data && <DisplayData data={data} />}
      {error && (
        <p>
          Error loading data: <code>{error.toString()}</code>
        </p>
      )}

      {!data && !error && startLoadingTime ? (
        <Loading startLoadingTime={startLoadingTime} />
      ) : null}
    </div>
  );
}

function Took({ milliseconds }: { milliseconds: number }) {
  const seconds = milliseconds / 1000;
  return <small>Took {seconds.toFixed(1)} seconds to load.</small>;
}

function Loading({ startLoadingTime }: { startLoadingTime: Date }) {
  const [estimateEndTime, setEstimateEndTime] = useState(
    // 15 seconds
    new Date(startLoadingTime.getTime() + 1000 * 15)
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
        Estimated time to finish: {((distance - elapsed) / 1000).toFixed(0)}s{" "}
        {elapsed > distance ? <span>🙃</span> : null}
      </small>
    </div>
  );
}

function DisplayData({ data }: { data: Data }) {
  return (
    <div>
      <Routes>
        <Route
          path="macros"
          element={
            <AllMacroUses macros={data.allMacros} documents={data.documents} />
          }
        />
        <Route
          path="database"
          element={<SQLTable documents={data.documents} />}
        />
        <Route path="*" element={<SubNav />} />
      </Routes>
    </div>
  );
}

function SubNav() {
  return (
    <div className="sub-nav">
      <ul>
        <li>
          <Link to="macros" className="button">
            Every Macro Used
          </Link>
        </li>
        <li>
          <Link to="database" className="button">
            Searchable Database
          </Link>
        </li>
      </ul>
    </div>
  );
}
