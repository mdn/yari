import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { usePageVisibility } from "./hooks";

import "./viewed-documents.scss";

type Entry = {
  url: string;
  title: string;
  timestamp: number;
};

// Simpler and cheaper than a proper library
function friendlyDateDisplay(date: Date): string {
  const today = new Date();
  const dateString = date.toDateString();
  const secondsDiff = (today.getTime() - date.getTime()) / 1000;
  if (secondsDiff < 60) {
    return "seconds ago";
  }
  if (secondsDiff < 60 * 15) {
    return "minutes ago";
  }
  if (today.toDateString() === dateString) {
    return "today";
  }
  const yesterday = new Date(today.getTime() - 1000 * 3600 * 24);
  if (yesterday.toDateString() === dateString) {
    return "yesterday";
  }
  return dateString;
}

export default function ViewedDocuments() {
  const isVisible = usePageVisibility();
  const [entries, setEntries] = useState<Entry[] | null>(null);

  useEffect(() => {
    if (isVisible) {
      const localStorageKey = "viewed-documents";
      const previousVisits = JSON.parse(
        localStorage.getItem(localStorageKey) || "[]"
      );
      const newEntries: Entry[] = [];
      // console.log(previousVisits);
      for (const visit of previousVisits) {
        newEntries.push({
          url: visit.url,
          title: visit.title,
          timestamp: visit.timestamp,
        });
      }

      if (newEntries.length) {
        setEntries(newEntries);
      }
    }
  }, [isVisible]);

  return (
    <article
      id="recently-viewed-documents"
      aria-labelledby="recently-viewed-documents"
    >
      <h2>Recently viewed documents</h2>
      {!entries ? (
        <Banner>Loading recently viewed documents</Banner>
      ) : entries.length ? (
        <table className="compact">
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
                  <td>{friendlyDateDisplay(new Date(entry.timestamp))}</td>
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
