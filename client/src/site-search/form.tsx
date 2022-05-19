import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import LANGUAGES_RAW from "../languages.json";

import { useLocale } from "../hooks";
import { appendURL } from "./utils";

const LANGUAGES = new Map(
  Object.entries(LANGUAGES_RAW).map(([locale, data]) => {
    return [locale.toLowerCase(), data];
  })
);

export default function SiteSearchForm() {
  const locale = useLocale();
  const [searchParams] = useSearchParams();
  const queryLocales = searchParams.getAll("locale");

  const showLanguageOptions = locale.toLowerCase() !== "en-us";
  const showAdvancedOptions = showLanguageOptions;

  if (!showAdvancedOptions) {
    return null;
  }

  return (
    <div className="advanced-options">
      {/* Language only applies if you're browsing in, say, French
      and want to search in English too. */}
      {showLanguageOptions && (
        <div className="language-options">
          <h2>Language:</h2>
          <ul className="language-option-list">
            <li>
              {!queryLocales.length ||
              (queryLocales.length === 1 &&
                equalLocales(queryLocales, [locale])) ? (
                <i>
                  // @ts-expect-error ts-migrate(2339) FIXME: Property 'native'
                  does not exist on type 'unknown'... Remove this comment to see
                  the full error message
                  {LANGUAGES.get(locale.toLowerCase())?.native} ( //
                  @ts-expect-error ts-migrate(2339) FIXME: Property 'English'
                  does not exist on type 'unknown... Remove this comment to see
                  the full error message
                  {LANGUAGES.get(locale.toLowerCase())?.English})
                </i>
              ) : (
                <Link
                  to={`?${appendURL(searchParams, {
                    locale: [locale],
                    page: undefined,
                  })}`}
                >
                  // @ts-expect-error ts-migrate(2339) FIXME: Property 'native'
                  does not exist on type 'unknown'... Remove this comment to see
                  the full error message
                  {LANGUAGES.get(locale.toLowerCase())?.native} ( //
                  @ts-expect-error ts-migrate(2339) FIXME: Property 'English'
                  does not exist on type 'unknown... Remove this comment to see
                  the full error message
                  {LANGUAGES.get(locale.toLowerCase())?.English})
                </Link>
              )}
            </li>
            <li>
              {queryLocales.length && equalLocales(queryLocales, ["en-us"]) ? (
                <i>{LANGUAGES.get("en-us")?.native}</i>
              ) : (
                <Link
                  to={`?${appendURL(searchParams, {
                    locale: ["en-US"],
                    page: undefined,
                  })}`}
                >
                  // @ts-expect-error ts-migrate(2339) FIXME: Property 'native'
                  does not exist on type 'unknown'... Remove this comment to see
                  the full error message
                  {LANGUAGES.get("en-us")?.native}
                </Link>
              )}
            </li>
            <li>
              {queryLocales.length === 2 &&
              equalLocales(queryLocales, [locale, "en-us"]) ? (
                <i>Both</i>
              ) : (
                <Link
                  to={`?${appendURL(searchParams, {
                    locale: [locale, "en-US"],
                    page: undefined,
                  })}`}
                >
                  Both
                </Link>
              )}
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

// Return true if two arrays, independent of case and order are equal.
// E.g. `['foo', 'Bar']` is equal to `['bar', 'FoO']`
function equalLocales(list1: string[], list2: string[]) {
  if (list1.length !== list2.length) {
    return false;
  }
  const list1LC = list1.map((x) => x.toLowerCase());
  const list2LC = list2.map((x) => x.toLowerCase());
  return list1LC.every((x) => list2LC.includes(x));
}
