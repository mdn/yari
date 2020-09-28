import React from "react";
import { Link } from "react-router-dom";

import LANGUAGES from "../languages.json";
import Dropdown from "./dropdown";
import { Translation } from "../document/types";

export default function LanguageMenu({
  locale,
  translations,
}: {
  locale: string;
  translations: Translation[];
}) {
  // For the menu label, we want to use the name of the document language.
  // We need a special case for English because English documents can
  // appear in pages for other locales, and in that case we need a
  // translation for the word "English". In all other cases, the
  // locale of the page and the locale of the document should match
  // and we can just use the document language string without translation.
  const verbose = LANGUAGES[locale];
  const chooseLanguageString = `Current language is ${
    (verbose && verbose.English) || locale
  }. Choose your preferred language.`;

  return (
    <Dropdown
      id="header-language-menu"
      componentClassName="language-menu"
      label={(verbose && verbose.English) || locale}
      right={true}
      ariaOwns="language-menu"
      ariaLabel={chooseLanguageString}
    >
      {translations.map((t) => {
        const verbose = LANGUAGES[t.locale];
        const url = `/${t.locale}/docs/${t.slug}`;
        return (
          <li key={url} lang={t.locale} role="menuitem">
            <Link to={url} title={verbose ? verbose.English : t.locale}>
              <bdi>{verbose ? verbose.native : t.locale}</bdi>
            </Link>
          </li>
        );
      })}
    </Dropdown>
  );
}
