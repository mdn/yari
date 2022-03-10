import React, { useState, useMemo, useEffect } from "react";
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
  hasOpened,
  onCloseSearch,
  onResultPicked,
  onChangeIsFocused = () => {},
}: {
  id: string;
  hasOpened?: boolean;
  onCloseSearch?: () => void;
  onResultPicked?: () => void;
  onChangeIsFocused?: (isFocused?: boolean) => void;
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
        onChangeIsFocused(isFocused);
      },
      defaultSelection,
      onChangeSelection: (selection) => setDefaultSelection(selection),
    }),
    [id, value, isFocused, defaultSelection, setValue, onChangeIsFocused]
  );

  useEffect(() => {
    if (hasOpened) {
      setIsFocused(true);
    }
  }, [hasOpened]);

  return (
    <div className="header-search">
      <SearchNavigateWidget
        {...searchProps}
        onResultPicked={onResultPicked}
        onCloseSearch={onCloseSearch}
      />
    </div>
  );
}
