import { useState } from "react";
import { Button } from "../../../ui/atoms/button";
import { OnGitHubLink } from "../../on-github";

import "./index.scss";
import { useGleanClick } from "../../../telemetry/glean-context";
import { ARTICLE_FEEDBACK as ARTICLE_FOOTER } from "../../../telemetry/constants";

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

enum ArticleFooterView {
  Vote,
  Feedback,
  Thanks,
}

type FeedbackReason = "outdated" | "incomplete" | "code_examples" | "other";

const FEEDBACK_REASONS: Required<Record<FeedbackReason, string>> = {
  outdated: "Content is out of date",
  incomplete: "Missing information",
  code_examples: "Code examples not working as expected",
  other: "Other",
};

export function ArticleFooter({ doc, locale }) {
  const [view, setView] = useState<ArticleFooterView>(ArticleFooterView.Vote);
  const [reason, setReason] = useState<FeedbackReason>();

  const gleanClick = useGleanClick();

  function handleVote(value: boolean) {
    setView(value ? ArticleFooterView.Thanks : ArticleFooterView.Feedback);
    gleanClick(`${ARTICLE_FOOTER}: vote -> ${Number(value)}`);
  }

  function handleFeedback() {
    setView(ArticleFooterView.Thanks);
    gleanClick(`${ARTICLE_FOOTER}: feedback -> ${reason}`);
  }

  return (
    <aside className="article-footer">
      <div className="article-footer-inner">
        <h2>
          {view !== ArticleFooterView.Feedback
            ? "Help improve MDN"
            : "Tell us more:"}
        </h2>

        <fieldset className="feedback">
          {view === ArticleFooterView.Vote ? (
            <>
              <label>Was this page helpful to you?</label>
              <div className="button-container">
                <Button
                  icon="thumbs-up"
                  extraClasses="yes"
                  onClickHandler={() => handleVote(true)}
                >
                  Yes
                </Button>
                <Button
                  icon="thumbs-down"
                  extraClasses="no"
                  onClickHandler={() => handleVote(false)}
                >
                  No
                </Button>
              </div>
            </>
          ) : view === ArticleFooterView.Feedback ? (
            <>
              <label>Why was this page not helpful to you?</label>
              {Object.entries(FEEDBACK_REASONS).map(([key, label]) => (
                <div className="radio-container" key={key}>
                  <input
                    type="radio"
                    id={`reason_${key}`}
                    name="reason"
                    value={key}
                    checked={reason === key}
                    onChange={(event) =>
                      setReason(event.target.value as FeedbackReason)
                    }
                  />
                  <label htmlFor={`reason_${key}`}>{label}</label>
                </div>
              ))}
              <div className="button-container">
                <Button
                  type="primary"
                  isDisabled={!reason}
                  onClickHandler={() => handleFeedback()}
                >
                  Submit
                </Button>
              </div>
            </>
          ) : (
            <span className="thank-you">Thank you for your feedback! ❤️</span>
          )}
        </fieldset>

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
