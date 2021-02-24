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

export function AdvancedSearchOptions() {
  const locale = useLocale();
  const [searchParams] = useSearchParams();
  const queryLocales = searchParams.getAll("locale");
  const isBoth =
    queryLocales.length === 2 && equalLocales(queryLocales, [locale, "en-us"]);
  const isCurrentLocale =
    !queryLocales.length ||
    (queryLocales.length === 1 && equalLocales(queryLocales, [locale]));
  const isEnglish =
    queryLocales.length && equalLocales(queryLocales, ["en-us"]);

  return (
    <>
      <h2>Language:</h2>
      <ul className="search-language-options">
        <li aria-current={isCurrentLocale ? true : false}>
          {isCurrentLocale ? (
            `${LANGUAGES.get(locale.toLowerCase())?.native} ${
              LANGUAGES.get(locale.toLowerCase())?.English
            }`
          ) : (
            <Link
              to={`?${appendURL(searchParams, {
                locale: [locale],
                page: undefined,
              })}`}
            >
              {LANGUAGES.get(locale.toLowerCase())?.native} (
              {LANGUAGES.get(locale.toLowerCase())?.English})
            </Link>
          )}
          {" | "}
        </li>
        <li aria-current={isEnglish ? true : false}>
          {isEnglish ? (
            LANGUAGES.get("en-us")?.native
          ) : (
            <Link
              to={`?${appendURL(searchParams, {
                locale: ["en-US"],
                page: undefined,
              })}`}
            >
              {LANGUAGES.get("en-us")?.native}
            </Link>
          )}
          {" | "}
        </li>
        <li aria-current={isBoth ? true : false}>
          {isBoth ? (
            "Both"
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
    </>
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
