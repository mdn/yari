import { Translation } from "../../../document/types";
import { CATEGORY_LANGUAGE_TOGGLE, useGA } from "../../../ga-context";

import "./index.scss";

export function LanguageToggle({
  locale,
  translations,
}: {
  locale: string;
  translations: Translation[];
}) {
  function GetLink(locale) {
    const ga = useGA();

    if (locale.toLowerCase() !== "en-us") {
      for (const translation of translations) {
        if (translation.locale.toLowerCase() === "en-us") {
          return (
            <a
              href={translation.url}
              className="language-icon default"
              onClick={() => {
                ga("send", {
                  hitType: "event",
                  eventCategory: CATEGORY_LANGUAGE_TOGGLE,
                  eventAction: `View in English link clicked. Current locale: ${locale}`,
                  eventLabel: "change-language",
                });
              }}
            >
              <span className="show-desktop">View in</span> English
            </a>
          );
        }
      }
    } else {
      return (
        <a
          href="#select_language"
          className="language-icon"
          onClick={() => {
            ga("send", {
              hitType: "event",
              eventCategory: CATEGORY_LANGUAGE_TOGGLE,
              eventAction: `Change language link clicked. Current locale: ${locale}`,
              eventLabel: "change-language",
            });
          }}
        >
          <span className="show-desktop">Change language</span>
        </a>
      );
    }
    return null;
  }

  return (
    <ul
      className={
        locale.toLowerCase() === "en-us"
          ? "language-toggle icon-only"
          : "language-toggle"
      }
    >
      <li>{GetLink(locale)}</li>
    </ul>
  );
}
