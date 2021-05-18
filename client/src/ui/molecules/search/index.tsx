import React, { Suspense, lazy, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import { useLocale } from "../../../hooks";
import type { SearchProps } from "../../../search";

import "./index.scss";

import "./basic-search-widget.scss";
const LazySearchNavigateWidget = lazy(() => import("../../../search"));

function useQueryParamState() {
  const [searchParams] = useSearchParams();
  const queryState = searchParams.get("q") || "";
  const [value, setValue] = useState(queryState);

  // The site-search page might trigger an update to the current
  // `?q=...` value and if that happens we want to be reflected in the search inputs
  React.useEffect(() => {
    setValue(queryState);
  }, [setValue, queryState]);

  return [value, setValue] as const;
}

const isServer = typeof window === "undefined";

export function Search(props) {
  const [value, setValue] = useQueryParamState();
  const [isFocused, setIsFocused] = useState(false);

  const searchProps = useMemo(
    () => ({
      inputValue: value,
      onChangeInputValue: (value) => setValue(value),
      isFocused,
      onChangeIsFocused: (isFocused) => setIsFocused(isFocused),
    }),
    [value, setValue, isFocused, setIsFocused]
  );
  return (
    <div className="header-search">
      {isServer ? (
        <BasicSearchWidget {...searchProps} />
      ) : (
        <Suspense fallback={<BasicSearchWidget {...searchProps} />}>
          <LazySearchNavigateWidget {...searchProps} {...props} />
        </Suspense>
      )}
    </div>
  );
}

export function BasicSearchWidget({
  isFocused,
  onChangeIsFocused,
  inputValue,
  onChangeInputValue,
}: SearchProps) {
  const locale = useLocale();
  return (
    <form action={`/${locale}/search`} className="search-form" role="search">
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
        value={inputValue}
        onChange={(e) => {
          onChangeInputValue(e.target.value);
        }}
        autoFocus={isFocused}
        onFocus={() => onChangeIsFocused(true)}
        onBlur={() => onChangeIsFocused(false)}
      />
      <input
        type="submit"
        className="ghost search-button"
        value=""
        aria-label="Search"
      />
    </form>
  );
}
