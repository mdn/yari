import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-sql";

// Necessary hack due to https://github.com/agershun/alasql/issues/930
// import alasql from "alasql";
import alasql from "../../../node_modules/alasql/dist/alasql.min.js";

import { Document } from "./types";
import "./sql-table.scss";

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
ADVANCED_QUERIES.push(`SELECT mdn_url, title, wordCount, fileSize
FROM ?
WHERE mdn_url like '%/Web/http%'
ORDER BY fileSize desc
LIMIT 25`);

export function SQLTable({ documents }: { documents: Document[] }) {
  const [query, setQuery] = useState("");
  const [queryDraft, setQueryDraft] = useSessionStorage("query", DEFAULT_QUERY);
  const [pastQueries, setPastQueries] = useLocalStorage("past-queries", []);
  const [result, setResult] = useState<any[] | null>(null);
  const [queryError, setQueryError] = useState<Error | null>(null);
  const [showHelp, toggleShowHelp] = useState(false);
  const [showPastQueries, toggleShowPastQueries] = useState(false);
  const [showSQLParserError, toggleShowSQLParserError] = useState(false);

  const [sqlParserError, setSQLParserError] = useState<Error | null>(null);

  useEffect(() => {
    if (query) {
      try {
        const res = alasql(query, [documents]);
        setResult(res);
        setPastQueries((state) =>
          [
            { query, results: res.length },
            ...state.filter((q) => q.query !== query),
          ].slice(0, 50)
        );
        setQueryError(null);
      } catch (error) {
        setQueryError(error);
      }
    } else {
      setResult(null);
    }
  }, [query, documents]);

  useEffect(() => {
    if (queryDraft) {
      try {
        alasql.parse(queryDraft);
        setSQLParserError(null);
      } catch (err) {
        setSQLParserError(err);
      }
    }
  }, [queryDraft]);

  return (
    <div className="sql-table">
      <form
        className="query"
        onSubmit={(event) => {
          event.preventDefault();
          setQuery(queryDraft.trim());
        }}
      >
        {/* <textarea
          value={queryDraft}
          className={sqlParserError ? "has-sql-error" : ""}
          onChange={(event) => setQueryDraft(event.target.value)}
          rows={Math.max(5, queryDraft.split("\n").length + 1)}
          spellCheck={false}
        ></textarea> */}
        <Editor
          value={queryDraft}
          onValueChange={(code) => setQueryDraft(code)}
          highlight={(code) => highlight(code, languages.sql)}
          textareaClassName={sqlParserError ? "has-sql-error" : ""}
          padding={10}
          style={{
            fontFamily: '"Fira code", "Fira Mono", monospace',
            backgroundColor: "#efefef",
          }}
          // rows={Math.max(5, queryDraft.split("\n").length + 1)}
        />
        <div className="query-buttons">
          {showSQLParserError && sqlParserError && (
            <div className="sql-error">
              <pre>{sqlParserError.toString()}</pre>
            </div>
          )}
          {queryError && (
            <div className="query-error">
              <h4>Query error</h4>
              <code>{queryError.toString()}</code>
            </div>
          )}
          <button
            type="submit"
            disabled={!!((result && queryDraft === query) || sqlParserError)}
          >
            Run query
          </button>{" "}
          <button
            type="button"
            onClick={() => {
              toggleShowHelp((s) => !s);
              toggleShowPastQueries(false);
            }}
          >
            {showHelp ? "Close help" : "Show help"}
          </button>{" "}
          <button
            type="button"
            onClick={() => {
              toggleShowPastQueries((s) => !s);
              toggleShowHelp(false);
            }}
          >
            {showPastQueries
              ? "Close past queries"
              : `Show past queries (${pastQueries.length})`}
          </button>{" "}
          <button
            type="button"
            disabled={!sqlParserError}
            onClick={() => {
              toggleShowSQLParserError((s) => !s);
            }}
          >
            {showSQLParserError && sqlParserError
              ? "Close error"
              : `SQL error${sqlParserError ? "!" : ""}`}
          </button>
        </div>
      </form>
      {showHelp && (
        <ShowHelp
          document={documents[0]}
          loadQuery={(q) => {
            setQueryDraft(q);
            const formElement = document.querySelector("form.query");
            if (formElement) {
              formElement.scrollIntoView({ behavior: "smooth" });
            }
            toggleShowHelp(false);
          }}
        />
      )}
      {showPastQueries && (
        <ShowPastQueries
          queries={pastQueries}
          loadQuery={(q) => {
            setQueryDraft(q);
            const formElement = document.querySelector("form.query");
            if (formElement) {
              formElement.scrollIntoView({ behavior: "smooth" });
            }
            toggleShowPastQueries(false);
          }}
          resetPastQueries={() => {
            setPastQueries([]);
            toggleShowPastQueries(false);
          }}
        />
      )}

      {result && <Results rows={result} />}
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

      <h4>
        Whatever <code>alasql</code> does
      </h4>
      <p>
        The SQL parser is based on{" "}
        <a
          href="https://github.com/agershun/alasql/wiki"
          target="_blank"
          rel="noopener noreferrer"
        >
          AlaSQL
        </a>
        . See its documentation for how to make queries. For example{" "}
        <a
          href="https://github.com/agershun/alasql/wiki/Data-manipulation"
          target="_blank"
          rel="noopener noreferrer"
        >
          Data manipulation Q&amp;A
        </a>{" "}
        and{" "}
        <a
          href="https://github.com/agershun/alasql/wiki/JSON"
          target="_blank"
          rel="noopener noreferrer"
        >
          Search in JSON arrays and objects
        </a>
      </p>
    </div>
  );
}

function ShowPastQueries({
  queries,
  loadQuery,
  resetPastQueries,
}: {
  queries: any[];
  loadQuery: (s: string) => void;
  resetPastQueries: () => void;
}) {
  return (
    <div className="past-queries">
      <h3>Past queries</h3>
      <button type="button" onClick={() => resetPastQueries()}>
        Clear past queries
      </button>
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
                <button
                  type="button"
                  onClick={() => {
                    loadQuery(query.query);
                  }}
                >
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

const Results = React.memo(({ rows }: { rows: any[] }) => {
  function triggerJSONDownload() {
    const blob = new Blob([JSON.stringify(rows, undefined, 2)], {
      type: "application/json",
    });
    // create hidden link, just force a click on it and then remove it from the DOM.
    const element = document.createElement("a");
    document.body.appendChild(element);
    element.setAttribute("href", window.URL.createObjectURL(blob));
    element.setAttribute("download", "results.json");
    element.style.display = "none";
    element.click();
    document.body.removeChild(element);
  }

  if (!rows.length) {
    return (
      <p className="no-results">
        <i>Nothing found.</i>
      </p>
    );
  }

  const keys = Object.keys(rows[0]);

  const MAX_ROWS = 1000;

  return (
    <div className="results">
      <p>
        <span className="results-count">
          <b>{rows.length.toLocaleString()}</b> results.
        </span>{" "}
        <button
          type="button"
          title="Click to start downloading as a .json file"
          onClick={() => {
            triggerJSONDownload();
          }}
        >
          Download as JSON
        </button>
      </p>
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
          {rows.slice(0, MAX_ROWS).map((row, i) => {
            const key = row.mdn_url || `${row[keys[0]]}:${i}`;
            return (
              <tr key={key}>
                <td>{i + 1}</td>
                {keys.map((key) => {
                  const value = row[key];

                  return (
                    <td key={key}>
                      {key === "mdn_url" && value ? (
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
      {rows.length > MAX_ROWS && (
        <div className="too-many-to-display">
          <p>
            Only displaying the first {MAX_ROWS.toLocaleString()} rows in the
            table.
          </p>
        </div>
      )}
    </div>
  );
});

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
