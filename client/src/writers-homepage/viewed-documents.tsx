import React from "react";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import "./viewed-documents.scss";
import { usePageVisibility } from "../hooks";

dayjs.extend(relativeTime);

type Entry = {
  url: string;
  title: string;
  timestamp: number;
};

export default function ViewedDocuments() {
  const isVisible = usePageVisibility();
  // undefined - list is still being loaded
  // null - list could not be loaded (e.g., if localStorage is disabled)
  // Entry[] - list was loaded (but could be empty)
  const [entries, setEntries] = React.useState<Entry[] | null | undefined>(
    undefined
  );

  const VIEWED_DOCUMENTS_STORAGE_KEY = "viewed-documents";

  React.useEffect(() => {
    if (isVisible) {
      try {
        const data = localStorage.getItem(VIEWED_DOCUMENTS_STORAGE_KEY);
        const previousVisits = JSON.parse(data || "[]");
        const newEntries: Entry[] = [];
        for (const visit of previousVisits) {
          newEntries.push({
            url: visit.url,
            title: visit.title,
            timestamp: visit.timestamp,
          });
        }

        setEntries(newEntries);
      } catch (err) {
        // If localStorage is not supported, there are no viewed documents
        console.warn(
          "Failed to read recently viewed documents from localStorage",
          err
        );
        setEntries(null);
      }
    }
  }, [isVisible]);

  return (
    <article
      id="recently-viewed-documents"
      aria-labelledby="recently-viewed-documents"
    >
      <h3>Recently viewed documents</h3>
      {entries === undefined ? (
        <Banner>Loading recently viewed documents</Banner>
      ) : entries === null ? (
        <Banner>This feature requires cookies</Banner>
      ) : entries.length ? (
        <table>
          <thead>
            <tr>
              <th>Document</th>
              <th>When</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => {
              return (
                <tr key={entry.url}>
                  <td>
                    <Link to={entry.url}>
                      {entry.title} <small>{entry.url}</small>
                    </Link>
                  </td>
                  <td>{dayjs(new Date(entry.timestamp)).fromNow()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <Banner>No recently viewed documents at the moment</Banner>
      )}
    </article>
  );
}

function Banner({ children }) {
  return <p className="notification">{children}</p>;
}
