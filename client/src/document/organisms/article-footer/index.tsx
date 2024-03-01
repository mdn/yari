import { useState } from "react";
import { Button } from "../../../ui/atoms/button";
import { OnGitHubLink } from "../../on-github";

import "./index.scss";
import { useGleanClick } from "../../../telemetry/glean-context";
import { ARTICLE_FEEDBACK } from "../../../telemetry/constants";

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
        <h2>Help improve MDN</h2>

        <Feedback />
        <Contribute />
        <p className="last-modified-date">
          <LastModified value={doc.modified} locale={locale} /> by{" "}
          <Authors url={doc.mdn_url} />.
        </p>
        {doc.isActive && <OnGitHubLink doc={doc} />}
      </div>
    </aside>
  );
}

function Feedback() {
  const [voted, setVoted] = useState<boolean>();
  const gleanClick = useGleanClick();

  function vote(value: boolean) {
    setVoted(value);
    gleanClick(`${ARTICLE_FEEDBACK}: vote -> ${Number(value)}`);
  }

  const hasVoted = typeof voted === "boolean";

  return (
    <fieldset className="feedback">
      {!hasVoted ? (
        <>
          <label>Was this page helpful to you?</label>
          <div className="button-container">
            <Button
              icon="thumbs-up"
              extraClasses="yes"
              onClickHandler={() => vote(true)}
            >
              Yes
            </Button>
            <Button
              icon="thumbs-down"
              extraClasses="no"
              onClickHandler={() => vote(false)}
            >
              No
            </Button>
          </div>
        </>
      ) : (
        <span className="thank-you">Thank you for your feedback! ❤️</span>
      )}
    </fieldset>
  );
}

function Contribute() {
  return (
    <>
      <a
        className="contribute"
        href="https://github.com/mdn/content/blob/main/CONTRIBUTING.md"
        title={`This will take you to our contribution guidelines on GitHub.`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Learn how to contribute
      </a>
      .
    </>
  );
}
