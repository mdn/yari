import { LanguageMenu } from "../../../ui/molecules/language-menu";
import { OnGitHubLink } from "../../on-github";

import "./index.scss";

function LastModified({ value, locale }) {
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
      <b>Last modified:</b>{" "}
      <time dateTime={value}>
        {date.toLocaleString(locale, dateStringOptions)}
      </time>
    </>
  );
}

export function Metadata({ doc, locale }) {
  const translations = doc.other_translations || [];
  const { native } = doc;

  return (
    <aside className="metadata">
      <div className="metadata-content-container">
        {doc.isActive && <OnGitHubLink doc={doc} />}
        <p className="last-modified-date">
          <LastModified value={doc.modified} locale={locale} />,{" "}
          <a href={`${doc.mdn_url}/contributors.txt`}>by MDN contributors</a>
        </p>
        {translations && !!translations.length && (
          <LanguageMenu
            translations={translations}
            native={native}
            locale={locale}
          />
        )}
      </div>
    </aside>
  );
}
