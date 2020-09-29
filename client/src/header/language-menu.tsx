import React from "react";
import { useNavigate } from "react-router-dom";

import LANGUAGES from "../languages.json";
import { Translation } from "../document/types";

export default function LanguageMenu({
  locale,
  translations,
}: {
  locale: string;
  translations: Translation[];
}) {
  const navigate = useNavigate();

  // For the menu label, we want to use the name of the document language.
  // We need a special case for English because English documents can
  // appear in pages for other locales, and in that case we need a
  // translation for the word "English". In all other cases, the
  // locale of the page and the locale of the document should match
  // and we can just use the document language string without translation.
  const verbose = LANGUAGES[locale];

  return (
    <form>
      <select
        name="language"
        defaultValue={locale}
        onChange={(event) => {
          const { value: url } = event.target;
          // If the selection was the existing document, do nothing
          if (url !== locale) {
            // Redirect
            navigate(url);
          }
        }}
      >
        {/*
          This option is alway there and always first.
          The reason it doesn't have the `disabled` attribute is because it
          might not render when viewing the select un-opened and instead what
          you see is the second option.
          The onChange callback is a protection for doing nothing if the
          already current locale is chosen.
         */}
        <option value={locale}>{verbose ? verbose.native : locale}</option>
        {translations.map((t) => {
          const verbose = LANGUAGES[t.locale];
          const url = `/${t.locale}/docs/${t.slug}`;
          return (
            <option key={url} value={url}>
              {verbose ? verbose.native : t.locale}
            </option>
          );
        })}
      </select>
    </form>
  );
}
