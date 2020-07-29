import * as React from "react";

import { Translations } from "../document/types";
import Dropdown from "./dropdown";

export default function LanguageMenu({
  locale,
  translations,
}: {
  locale: string;
  translations?: Translations;
}): React.ReactNode {
  // If there are no translations available and there is no translateURL,
  // don't display anything.
  if (!translations || translations.length === 0) {
    return null;
  }

  // For the menu label, we want to use the name of the document language.
  // We need a special case for English because English documents can
  // appear in pages for other locales, and in that case we need a
  // translation for the word "English". In all other cases, the
  // locale of the page and the locale of the document should match
  // and we can just use the document language string without translation.
  const chooseLanguageString = `Current language is ${locale}. Choose your preferred language.`;

  return (
    <Dropdown
      id="header-language-menu"
      componentClassName="language-menu"
      label={locale}
      right={true}
      ariaOwns="language-menu"
      ariaLabel={chooseLanguageString}
    >
      {translations.map((t) => (
        <li key={t.locale} lang={t.locale} role="menuitem">
          <a href={t.slug} title={t.locale}>
            <bdi>{t.locale}</bdi>
          </a>
        </li>
      ))}
    </Dropdown>
  );
}
