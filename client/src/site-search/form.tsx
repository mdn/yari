import React from "react";

import LANGUAGES_RAW from "../languages.json";
import { SiteSearchQuery } from "./types";

const LANGUAGES = new Map(
  Object.entries(LANGUAGES_RAW).map(([locale, data]) => {
    return [locale.toLowerCase(), data];
  })
);

export default function SiteSearchForm({
  query,
  locale,
  onSubmit,
}: {
  query: SiteSearchQuery;
  locale: string;
  onSubmit: (query: SiteSearchQuery) => void;
}) {
  function showAdancedOptionsDefault() {
    console.log("Show advanced search options by default??", query);
    if (query.sort && query.sort !== "best") {
      return true;
    }
    return false;
  }
  const [showAdvancedOptions, toggleShowAdvancedOptions] = React.useReducer(
    (state) => !state,
    showAdancedOptionsDefault()
  );
  const [newQuery, setNewQuery] = React.useState(Object.assign({}, query));

  return (
    <form
      action={`/${locale}/search`}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(newQuery);
      }}
    >
      {/* <pre>{JSON.stringify(newQuery)}</pre> */}
      <input
        type="search"
        name="q"
        value={newQuery.q}
        onChange={(event) => {
          setNewQuery(Object.assign({}, newQuery, { q: event.target.value }));
        }}
      />{" "}
      <button type="submit">Search</button>{" "}
      <button
        type="button"
        onClick={() => {
          toggleShowAdvancedOptions();
        }}
      >
        Advanced search options
      </button>
      {showAdvancedOptions && (
        <AdvancedOptions
          locale={locale}
          query={newQuery}
          updateQuery={(queryUpdates: SiteSearchQuery) => {
            const newQuery = Object.assign({}, query, queryUpdates);
            setNewQuery(newQuery);
          }}
        />
      )}
    </form>
  );
}

function AdvancedOptions({
  query,
  locale,
  updateQuery,
}: {
  query: SiteSearchQuery;
  locale: string;
  updateQuery: (query: SiteSearchQuery) => void;
}) {
  return (
    <div className="advanced-options">
      {/* Language only applies if you're browsing in, say, French
      and want to search in English too. */}
      {locale !== "en-US" && (
        <div className="advanced-option">
          <label htmlFor="id_locale">Language</label>
          <select
            id="id_locale"
            value={query.locale.length === 2 ? "both" : query.locale[0]}
            onChange={(event) => {
              const { value } = event.target;
              // Note, changing language should reset the `page`.
              // For example, if you're on page 3 of "fr" and change to "en-us"
              // there might, now, not be a page 3.
              if (value === "both") {
                updateQuery({
                  q: query.q,
                  locale: ["en-us", locale],
                  page: "",
                });
              } else {
                updateQuery({ q: query.q, locale: [value], page: "" });
              }
            }}
          >
            <option value={locale.toLowerCase()}>
              {LANGUAGES.get(locale.toLowerCase())?.native} (
              {LANGUAGES.get(locale.toLowerCase())?.English})
            </option>

            <option value="en-us">{LANGUAGES.get("en-us")?.native})</option>
            <option value="both">Both</option>
          </select>
        </div>
      )}

      {/* Rank choice */}
      <div className="advanced-option">
        <label htmlFor="id_sort">Sort</label>
        <select
          id="id_sort"
          value={query.sort ? query.sort : "best"}
          onChange={(event) => {
            const { value } = event.target;
            updateQuery({ q: query.q, locale: query.locale, sort: value });
          }}
        >
          <option value="best">Best</option>
          <option value="relevance">Relevance</option>
          <option value="popularity">Popularity</option>
        </select>
      </div>
    </div>
  );
}
