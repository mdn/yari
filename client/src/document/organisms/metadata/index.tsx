import React from "react";
import { OnGitHubLink } from "../../on-github";
import { useTranslation } from "react-i18next";
import i18n from "../../locales/i18n";

import "./index.scss";

export function LastModified({ value, locale }) {
  const { t } = useTranslation();
  React.useEffect(() => {
    i18n.changeLanguage(locale);
  }, [locale]);

  if (!value) {
    return <span>{t("LastModified.Last modified date not known")}</span>;
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
      {t("LastModified.This page was last modified on")}{" "}
      <time dateTime={value} suppressHydrationWarning>
        {date.toLocaleString(locale, dateStringOptions)}
      </time>
    </>
  );
}

export function Authors({ url, locale }) {
  const { t } = useTranslation();
  React.useEffect(() => {
    i18n.changeLanguage(locale);
  }, [locale]);
  return (
    <a href={`${url}/contributors.txt`}>{t("LastModified.MDN contributors")}</a>
  );
}

export function Metadata({ doc, locale }) {
  if (locale === "ko") {
    return (
      <aside className="metadata">
        <div className="metadata-content-container">
          {doc.isActive && <OnGitHubLink doc={doc} />}
          <p className="last-modified-date">
            <LastModified value={doc.modified} locale={locale} />{" "}
            <Authors url={doc.mdn_url} locale={locale} />에 의해 번역되었습니다.
          </p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="metadata">
      <div className="metadata-content-container">
        {doc.isActive && <OnGitHubLink doc={doc} />}
        <p className="last-modified-date">
          <LastModified value={doc.modified} locale={locale} /> by{" "}
          <Authors url={doc.mdn_url} locale={locale} />.
        </p>
      </div>
    </aside>
  );
}
