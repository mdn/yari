// @ts-expect-error ts-migrate(1259) FIXME: Module '"/Users/claas/github/mdn/yari/node_modules... Remove this comment to see the full error message
import React, { useState, useMemo } from "react";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module 'react-router-dom'. Did you mea... Remove this comment to see the full error message
import { useSearchParams } from "react-router-dom";

import SearchNavigateWidget from "../../../search";

import "./index.scss";

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
  onResultPicked,
}: {
  id: string;
  isHomepageSearch?: boolean;
  onResultPicked?: () => void;
}) {
  const [value, setValue] = useQueryParamState();
  const [isFocused, setIsFocused] = useState(false);
  const [defaultSelection, setDefaultSelection] = useState([0, 0] as const);

  const searchProps = useMemo(
    () => ({
      id,
      inputValue: value,
      onChangeInputValue: (value) => setValue(value),
      isFocused,
      onChangeIsFocused: (isFocused) => {
        setIsFocused(isFocused);
      },
      defaultSelection,
      onChangeSelection: (selection) => setDefaultSelection(selection),
    }),
    [id, value, isFocused, defaultSelection, setValue]
  );

  return (
    <div
      className={isHomepageSearch ? "homepage-hero-search" : "header-search"}
    >
      <SearchNavigateWidget {...searchProps} onResultPicked={onResultPicked} />
    </div>
  );
}
