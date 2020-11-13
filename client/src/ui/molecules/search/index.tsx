import * as React from "react";

// The temporary solution... See below around the BasicSearchWidget component.
// import { SearchNavigateWidget } from "../../../search";
import LazySearchNavigateWidget from "./lazy-search-widget";

import { AUTOCOMPLETE_SEARCH_WIDGET } from "../../../constants";
import { useLocale } from "../../../hooks";

import "./index.scss";

export function Search(props) {
  return (
    <div className="header-search">
      {/* See the code comment next to the <BasicSearchWidget> component */}
      {AUTOCOMPLETE_SEARCH_WIDGET ? (
        <LazySearchNavigateWidget {...props} />
      ) : (
        <BasicSearchWidget />
      )}
    </div>
  );
}

// This is a TEMPORARY solution.
// In the Yari1 launch we want to disable the auto-complete search that Yari has.
// Instead we want it to look and behave just like the search widget you get
// on the Kuma pages.
// The general idea is that we keep it like this for the period of time when
// the home page and site-search pages are still rendered in Kuma.
// Once all pages come from Yari, we'll get rid of this.
// For more context and discussion see https://github.com/mdn/yari/issues/1663

export function BasicSearchWidget() {
  const locale = useLocale();
  return (
    <form action={`/${locale}/search`}>
      <label htmlFor="main-q" className="visually-hidden">
        Search MDN
      </label>
      <input
        type="search"
        name="q"
        id="main-q"
        className="search-input-field"
        placeholder="Search MDN"
        pattern="(.|\s)*\S(.|\s)*"
        required
      />
    </form>
  );
}
