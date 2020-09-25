import React from "react";
import { Link } from "react-router-dom";

import "./languages.css";
import LANGUAGES from "../languages.json";
import { Translation } from "./types";

export function DocumentTranslations({
  translations,
}: {
  translations: Translation[];
}) {
  const [showChoices, setShowChoices] = React.useState(false);

  return (
    <div className="document-languages">
      {showChoices ? (
        <div className="choices">
          <a
            href="."
            onClick={(event) => {
              event.preventDefault();
              setShowChoices(false);
            }}
          >
            <b>Close ⨂</b>
          </a>
          <ShowTranslations
            translations={translations}
            onPicked={() => {
              // The user has clicked on one. We can close the menu now.
              setShowChoices(false);
            }}
          />
        </div>
      ) : (
        <a
          href="."
          onClick={(event) => {
            event.preventDefault();
            setShowChoices(true);
          }}
        >
          Change language
        </a>
      )}
    </div>
  );
}

function ShowTranslations({
  translations,
  onPicked,
}: {
  translations: Translation[];
  onPicked: () => void;
}) {
  return (
    <div className="translations">
      <ul>
        {translations.map((translation) => {
          const { slug, locale } = translation;
          const url = `/${locale}/docs/${slug}`;
          const verbose = LANGUAGES[locale];
          return (
            <li key={url}>
              <Link
                to={url}
                title={verbose ? verbose.English : null}
                onClick={() => {
                  onPicked();
                }}
              >
                {verbose ? verbose.native : locale}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
