import React, { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import SearchNavigateWidget from "../../../search";

import "./index.scss";
import { useGleanClick } from "../../../telemetry/glean-context";
import { QUICKSEARCH } from "../../../telemetry/constants";

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

export function Search({
  id,
  isHomepageSearch,
}: {
  id: string;
  isHomepageSearch?: boolean;
}) {
  const [value, setValue] = useQueryParamState();
  const [isFocused, setIsFocused] = useState(false);
  const [defaultSelection, setDefaultSelection] = useState([0, 0] as const);

  const gleanClick = useGleanClick();

  const searchProps = useMemo(
    () => ({
      id,
      inputValue: value,
      onChangeInputValue: (value) => setValue(value),
      isFocused,
      onChangeIsFocused: (isFocused) => setIsFocused(isFocused),
      defaultSelection,
      onChangeSelection: (selection) => setDefaultSelection(selection),
      onResultClick: (
        value: string,
        _event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
      ) => {
        gleanClick(`${QUICKSEARCH}: ${value}`);
      },
    }),
    [id, value, isFocused, defaultSelection, setValue, gleanClick]
  );

  return (
    <div
      className={isHomepageSearch ? "homepage-hero-search" : "header-search"}
    >
      <SearchNavigateWidget {...searchProps} />
    </div>
  );
}
