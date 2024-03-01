import { OnGitHubLink } from "../../on-github";

import "./index.scss";

export function LastModified({ value, locale }) {
  if (!value) {
    return <span>Last modified date not known</span>;
  }
  const date = new Date(value);
  // Justification for these is to match historically
  const dateStringOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  return (
    <>
      This page was last modified on{" "}
      <time dateTime={value} suppressHydrationWarning>
        {date.toLocaleString(locale, dateStringOptions)}
      </time>
    </>
  );
}

export function Authors({ url }) {
  return <a href={`${url}/contributors.txt`}>MDN contributors</a>;
}

export function ArticleFooter({ doc, locale }) {
  return (
    <aside className="article-footer">
      <div className="article-footer-content-container">
        {doc.isActive && <OnGitHubLink doc={doc} />}
        <p className="last-modified-date">
          <LastModified value={doc.modified} locale={locale} /> by{" "}
          <Authors url={doc.mdn_url} />.
        </p>
      </div>
    </aside>
  );
}
