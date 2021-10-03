import { Link, useLocation } from "react-router-dom";

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
  const { pathname } = useLocation();
  function translateURL(destinationLocale: string) {
    return pathname.replace(`/${locale}/`, `/${destinationLocale}/`);
  }

  function getEnglishLink() {
    for (const translation of translations) {
      if (translation.locale.toLowerCase() === "en-us") {
        const translationURL = translateURL(translation.locale);
        return (
          <Link
            to={translationURL}
            className="view-in-english"
            onClick={() => {
              ga("send", {
                hitType: "event",
                eventCategory: "Language",
                eventAction: "Switch to English",
                eventLabel: `${window.location.pathname} to ${translationURL}`,
              });
            }}
          >
            <span className="show-desktop">View in</span> English
          </Link>
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
          onClick={(event) => {
            const destination = document.querySelector("#select-language");
            if (destination) {
              destination.scrollIntoView({ behavior: "smooth" });
              event.preventDefault();
            }

            ga("send", {
              hitType: "event",
              eventCategory: "Language",
              eventAction: "Anchor to language choice",
              eventLabel: window.location.pathname,
            });
          }}
        >
          <span className="show-desktop">Change language</span>
        </a>
      </li>
      {locale.toLowerCase() !== "en-us" && <li>{getEnglishLink()}</li>}
    </ul>
  );
}
