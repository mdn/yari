import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import alasql from "alasql";

import { Document } from "./types";

const DEFAULT_QUERY = "SELECT title FROM ? ORDER BY popularity DESC LIMIT 10";
const ADVANCED_QUERIES: string[] = [];
ADVANCED_QUERIES.push(`SELECT mdn_url, normalizedMacrosCount -> jsxref, popularity
FROM ?
WHERE normalizedMacrosCount -> jsxref > 5
ORDER BY popularity desc
LIMIT 25`);
ADVANCED_QUERIES.push(`SELECT title->length AS len, title, mdn_url
FROM ?
ORDER BY len DESC
LIMIT 100`);

export function SQLTable({ documents }: { documents: Document[] }) {
  const [query, setQuery] = useState("");
  const [queryDraft, setQueryDraft] = useSessionStorage("query", DEFAULT_QUERY);
  const [pastQueries, setPastQueries] = useLocalStorage("past-queries", []);
  const [result, setResult] = useState<any[] | null>(null);
  const [queryError, setQueryError] = useState<Error | null>(null);
  const [showHelp, toggleShowHelp] = useState(false);
  const [showPastQueries, toggleShowPastQueries] = useState(false);

  useEffect(() => {
    if (query) {
      try {
        const res = alasql(query, [documents]);
        setResult(res);
        setPastQueries((state) => [
          { query, results: res.length },
          ...state.filter((q) => q.query !== query),
        ]);
      } catch (error) {
        setQueryError(error);
      }
    } else {
      setResult(null);
    }
  }, [query, documents]);

  return (
    <div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setQuery(queryDraft.trim());
        }}
      >
        <textarea
          value={queryDraft}
          onChange={(event) => setQueryDraft(event.target.value)}
          rows={Math.max(5, queryDraft.split("\n").length + 1)}
          style={{ width: "100%" }}
        ></textarea>
        {queryError && (
          <div style={{ backgroundColor: "pink" }}>
            <h4>Query error</h4>
            <code>{queryError.toString()}</code>
          </div>
        )}
        <button type="submit" disabled={!!(result && queryDraft === query)}>
          Run query
        </button>{" "}
        <button type="button" onClick={() => toggleShowHelp((s) => !s)}>
          {showHelp ? "Close help" : "Show help"}
        </button>{" "}
        <button type="button" onClick={() => toggleShowPastQueries((s) => !s)}>
          {showPastQueries
            ? "Close past queries"
            : `Show past queries (${pastQueries.length})`}
        </button>
      </form>
      {showHelp && (
        <ShowHelp
          document={documents[0]}
          loadQuery={(q) => {
            setQueryDraft(q);
          }}
        />
      )}
      {showPastQueries && (
        <ShowPastQueries
          queries={pastQueries}
          loadQuery={(q) => {
            setQueryDraft(q);
          }}
        />
      )}

      {/* {result ? `${result.length.toLocaleString()} results` : "no results"} */}
      {result && <Table rows={result} />}
    </div>
  );
}

function ShowHelp({
  document,
  loadQuery,
}: {
  document: Document;
  loadQuery: (s: string) => void;
}) {
  return (
    <div className="help">
      <h4>List of keys you can select from</h4>
      <ul>
        {Object.keys(document).map((key) => (
          <li key={key}>
            <code>{key}</code>
          </li>
        ))}
      </ul>
      <h4>Sample queries</h4>
      <div>
        <pre>
          <code>{DEFAULT_QUERY}</code>
        </pre>
        <button type="button" onClick={() => loadQuery(DEFAULT_QUERY)}>
          Load
        </button>
      </div>
      {ADVANCED_QUERIES.map((query) => {
        return (
          <div key={query}>
            <pre>
              <code>{query}</code>
            </pre>
            <button type="button" onClick={() => loadQuery(query)}>
              Load
            </button>
          </div>
        );
      })}
    </div>
  );
}

function ShowPastQueries({
  queries,
  loadQuery,
}: {
  queries: any[];
  loadQuery: (s: string) => void;
}) {
  return (
    <div className="help">
      <p>Past queries</p>
      <table>
        <thead>
          <tr>
            <th>Results</th>
            <th>Query</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {queries.map((query) => (
            <tr key={query.query}>
              <td>{query.results.toLocaleString()}</td>

              <td>
                <code>{query.query}</code>
              </td>
              <td>
                <button type="button" onClick={() => loadQuery(query.query)}>
                  Load again
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Table({ rows }: { rows: any[] }) {
  if (!rows.length) {
    return (
      <p>
        <i>Nothing found.</i>
      </p>
    );
  }
  const keys = Object.keys(rows[0]);

  return (
    <div>
      <hr />
      <p>{rows.length.toLocaleString()} results.</p>
      <table>
        <thead>
          <tr>
            <th>#</th>
            {keys.map((key) => (
              <th key={key}>{key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const key = row.mdn_url || `${row[keys[0]]}:${i}`;
            return (
              <tr key={key}>
                <td>{i + 1}</td>
                {keys.map((key) => {
                  const value = row[key];
                  return (
                    <td key={key}>
                      {key === "mdn_url" ? (
                        <Link to={value} target="_blank">
                          {value}
                        </Link>
                      ) : typeof value === "object" ? (
                        JSON.stringify(value)
                      ) : typeof value === "number" ? (
                        value.toLocaleString()
                      ) : (
                        value
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

/**
 * From https://usehooks.com/useLocalStorage/
 */
function useLocalStorage(
  key: string,
  initialValue,
  storage = window.localStorage
) {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // Get from local storage by key
      const item = storage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error also return initialValue
      console.log(error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);
      // Save to local storage
      storage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.log(error);
    }
  };
  return [storedValue, setValue];
}

function useSessionStorage(key: string, initialValue) {
  return useLocalStorage(key, initialValue, window.sessionStorage);
}
