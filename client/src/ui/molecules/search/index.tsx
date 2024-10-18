import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { useSearchParams } from "react-router-dom";

import SearchNavigateWidget, {
  SearchNavigateWidgetProps,
} from "../../../search";

import "./index.scss";
import { useGleanClick } from "../../../telemetry/glean-context";
import {
  QUICKSEARCH,
  SEARCH,
  SEARCH_ACTIONS,
} from "../../../telemetry/constants";

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

  const gleanClick = useGleanClick();
  const lastFocus = useRef(isFocused);
  const lastValue = useRef(value);
  const [hasOpened, setHasOpened] = useState(false);
  const [hasEdited, setHasEdited] = useState(false);
  const [hasClicked, setHasClicked] = useState(false);

  const name = isHomepageSearch ? "hp" : "top";

  const measure = useCallback(
    (action: string, value?: string) => {
      gleanClick(
        `${SEARCH}: ${name} ${action}` + (value ? ` -> ${value}` : "")
      );
    },
    [gleanClick, name]
  );

  useEffect(() => {
    if (isFocused !== lastFocus.current) {
      if (isFocused) {
        measure(SEARCH_ACTIONS.OPEN);
        setHasOpened(true);
      } else {
        if (!hasClicked) {
          measure(SEARCH_ACTIONS.CLOSE);
        }
        // Search completed.
        setHasOpened(false);
        setHasEdited(false);
        setHasClicked(false);
      }
      lastFocus.current = isFocused;
    }
  }, [isFocused, hasOpened, hasClicked, measure]);

  useEffect(() => {
    if (value !== lastValue.current) {
      if (!hasEdited) {
        measure(SEARCH_ACTIONS.EDIT);
        setHasEdited(true);
      }
      lastValue.current = value;
    }
  }, [value, hasEdited, measure]);

  const searchProps: SearchNavigateWidgetProps = useMemo(
    () => ({
      id,
      inputValue: value,
      onChangeInputValue: (value) => setValue(value),
      isFocused,
      onChangeIsFocused: (isFocused) => setIsFocused(isFocused),
      defaultSelection: [0, 0],
      onResultClick: (
        value: string,
        event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
      ) => {
        gleanClick(`${QUICKSEARCH}: ${value}`);
        measure(SEARCH_ACTIONS.CLICK, event.currentTarget.href);
        setHasClicked(true);
      },
    }),
    [id, value, isFocused, setValue, gleanClick, measure]
  );

  return (
    <div
      className={isHomepageSearch ? "homepage-hero-search" : "header-search"}
    >
      <SearchNavigateWidget {...searchProps} />
    </div>
  );
}
