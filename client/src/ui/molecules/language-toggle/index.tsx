import { Translation } from "../../../document/types";
import { useGA } from "../../../ga-context";

import "./index.scss";

export function LanguageToggle({
  locale,
  translations,
}: {
  locale: string;
  translations: Translation[];
}) {
  const ga = useGA();

  function getLink(locale) {
    for (const translation of translations) {
      if (translation.locale.toLowerCase() === "en-us") {
        return (
          <a
            href={translation.url}
            onClick={() => {
              ga("send", {
                hitType: "event",
                eventCategory: "Language",
                eventAction: "Switch to English",
                eventLabel: `Changing from ${locale} to English`,
              });
            }}
          >
            <span className="show-desktop">View in</span> English
          </a>
        );
      }
    }
    return null;
  }

  return (
    <ul
      className={
        locale.toLowerCase() === "en-us"
          ? "language-toggle single-option"
          : "language-toggle"
      }
    >
      <li>
        <a
          href="#select-language"
          className="language-icon"
          onClick={() => {
            ga("send", {
              hitType: "event",
              eventCategory: "Language",
              eventAction: "Anchor to language choice",
              eventLabel: `Change language on ${locale}`,
            });
          }}
        >
          <span className="show-desktop">Change language</span>
        </a>
      </li>
      {locale.toLowerCase() !== "en-us" && <li>{getLink(locale)}</li>}
    </ul>
  );
}
