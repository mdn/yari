import * as React from "react";

import { Translation } from "../../../document/types";

import "./index.scss";

export function LanguageToggle({
  locale,
  translations,
}: {
  locale: string;
  translations: Translation[];
}) {
  /**
   * Loops through translations array and returns the URL
   * for the en-US locale
   */
  function getEnglishURL() {
    for (let translation of translations) {
      if (translation.locale.toLowerCase() === "en-us") {
        return translation.url;
      }
    }
  }

  return (
    <ul className="language-toggle">
      <li>
        <a href="#select_language" className="icon language-icon">
          <span className="show-desktop">Change language</span>
        </a>
      </li>
      {locale.toLocaleLowerCase() !== "en-us" && (
        <li className="en-switch">
          <a href={getEnglishURL()}>English</a>
        </li>
      )}
    </ul>
  );
}
