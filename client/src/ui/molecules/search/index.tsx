import React, { lazy, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import "./index.scss";

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

export function Search({ onResultPicked }: { onResultPicked?: () => void }) {
  const [value, setValue] = useQueryParamState();
  const [isFocused, setIsFocused] = useState(false);
  const [defaultSelection, setDefaultSelection] = useState([0, 0] as const);

  const searchProps = useMemo(
    () => ({
      inputValue: value,
      onChangeInputValue: (value) => setValue(value),
      isFocused,
      onChangeIsFocused: (isFocused) => {
        setIsFocused(isFocused);
      },
      defaultSelection,
      onChangeSelection: (selection) => setDefaultSelection(selection),
    }),
    [value, isFocused, defaultSelection, setValue]
  );

  return (
    <div className="header-search">
      <LazySearchNavigateWidget
        {...searchProps}
        onResultPicked={onResultPicked}
      />
    </div>
  );
}
