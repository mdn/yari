// @ts-expect-error ts-migrate(1259) FIXME: Module '"/Users/claas/github/mdn/yari/node_modules... Remove this comment to see the full error message
import React from "react";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module 'react-router-dom'. Did you mea... Remove this comment to see the full error message
import { Link } from "react-router-dom";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module 'dayjs'. Did you mean to set th... Remove this comment to see the full error message
import dayjs from "dayjs";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module 'dayjs/plugin/relativeTime'. Di... Remove this comment to see the full error message
import relativeTime from "dayjs/plugin/relativeTime";

import { usePageVisibility } from "./hooks";

import "./viewed-documents.scss";

dayjs.extend(relativeTime);

type Entry = {
  url: string;
  title: string;
  timestamp: number;
};

export default function ViewedDocuments() {
  const isVisible = usePageVisibility();
  const [entries, setEntries] = React.useState<Entry[] | null>(null);

  React.useEffect(() => {
    if (isVisible) {
      const localStorageKey = "viewed-documents";
      const previousVisits = JSON.parse(
        localStorage.getItem(localStorageKey) || "[]"
      );
      const newEntries: Entry[] = [];
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
      <h3>Recently viewed documents</h3>
      {!entries ? (
        <Banner>Loading recently viewed documents</Banner>
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
