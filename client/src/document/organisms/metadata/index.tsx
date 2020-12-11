import * as React from "react";

import { OnGitHubLink } from "../../on-github";

import "./index.scss";

function LastModified({ value, locale }) {
  if (!value) {
    return <span>Last modified date not known</span>;
  }
  const date = new Date(value);
  // Justification for these is to match historically
  const dateStringOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  return (
    <>
      <b>Last modified:</b>{" "}
      <time dateTime={value}>
        {date.toLocaleString(locale, dateStringOptions)}
      </time>
    </>
  );
}

export function Metadata({ doc, locale }) {
  return (
    <aside className="metadata">
      <div className="metadata-content-container">
        {!doc.isArchive && <OnGitHubLink doc={doc} />}
        <p className="last-modified-date">
          <LastModified value={doc.modified} locale={locale} />,{" "}
          <a href={`${doc.mdn_url}/contributors.txt`}>by MDN contributors</a>
        </p>
      </div>
    </aside>
  );
}
