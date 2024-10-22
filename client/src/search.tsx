import React, { useEffect, useMemo, useRef, useState } from "react";
import { useCombobox } from "downshift";
import useSWR from "swr";

import { preload, preloadSupported } from "./document/preloading";

import { Button } from "./ui/atoms/button";

import { useLocale } from "./hooks";
import { SearchProps, useFocusViaKeyboard } from "./search-utils";
import { useGleanClick } from "./telemetry/glean-context";
import { splitQuery } from "./utils";

const PRELOAD_WAIT_MS = 500;
const SHOW_INDEXING_AFTER_MS = 500;

type Item = {
  url: string;
  title: string;
};

type FlexItem = [index: number, title: string, slugTail: string];

type SearchIndex = {
  flex: FlexItem[];
  items: null | Item[];
};

type ResultItem = {
  title: string;
  url: string;
  positions: Set<number>;
};

function quicksearchPing(input: string) {
  return `quick-search: ${input}`;
}

function useSearchIndex(): readonly [
  null | SearchIndex,
  null | Error,
  () => void,
] {
  const [shouldInitialize, setShouldInitialize] = useState(false);
  const [searchIndex, setSearchIndex] = useState<null | SearchIndex>(null);
  // Default to 'en-US' if you're on the home page without the locale prefix.
  const locale = useLocale();

  const url = `/${locale}/search-index.json`;

  const { error, data } = useSWR<null | Item[], Error | undefined>(
    shouldInitialize ? url : null,
    async (url: string) => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(await response.text());
      }
      return await response.json();
    },
    { revalidateOnFocus: false }
  );

  useEffect(() => {
    if (!data) {
      return;
    }
    const gather = async () => {
      const flex = data.map(
        ({ title, url }, i): FlexItem => [
          i,
          title.toLowerCase(),
          (url.split("/").pop() as string).toLowerCase(),
        ]
      );

      setSearchIndex({
        flex,
        items: data,
      });
    };
    gather();
  }, [shouldInitialize, data]);

  return useMemo(
    () => [searchIndex, error || null, () => setShouldInitialize(true)],
    [searchIndex, error, setShouldInitialize]
  );
}

function HighlightMatch({ title, q }: { title: string; q: string }) {
  // Split on highlight term and include term into parts, ignore case.
  const words = splitQuery(q);
  // $& means the whole matched string
  const regexWords = words.map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const regex = regexWords.map((word) => `(${word})`).join("|");
  const parts = title.split(new RegExp(regex, "gi"));
  return (
    <b>
      {parts.filter(Boolean).map((part, i) => {
        const key = `${part}:${i}`;
        if (words.includes(part.toLowerCase())) {
          return <mark key={key}>{part}</mark>;
        } else {
          return <span key={key}>{part}</span>;
        }
      })}
    </b>
  );
}

function BreadcrumbURI({
  uri,
  positions,
}: {
  uri: string;
  positions?: Set<number>;
}) {
  if (positions && positions.size) {
    const chars = uri.split("");
    return (
      <small>
        {chars.map((char, i) => {
          if (positions.has(i)) {
            return <mark key={i}>{char}</mark>;
          } else {
            return <span key={i}>{char}</span>;
          }
        })}
      </small>
    );
  }
  const keep = uri
    .split("/")
    .slice(1)
    .filter((p) => p !== "docs");
  return <small>{keep.join(" / ")}</small>;
}

type InnerSearchNavigateWidgetProps = SearchProps & {
  defaultSelection: [number, number];
};

function useHasNotChangedFor(value: string, ms: number) {
  const [hasNotChanged, setHasNotChanged] = useState(false);
  const previousValue = useRef(value);

  useEffect(() => {
    if (previousValue.current === value) {
      return;
    }
    previousValue.current = value;
    setHasNotChanged(false);
    // while timeouts are not accurate for counting time there error is only
    // upwards, meaning they might trigger after more time than specified,
    // which is fine in this case
    const timeout = setTimeout(() => {
      setHasNotChanged(true);
    }, ms);
    return () => {
      clearTimeout(timeout);
    };
  }, [value, ms]);

  return hasNotChanged;
}

function InnerSearchNavigateWidget(props: InnerSearchNavigateWidgetProps) {
  const {
    id,
    inputValue,
    onChangeInputValue,
    isFocused,
    onChangeIsFocused,
    defaultSelection,
  } = props;

  const formId = `${id}-form`;
  const locale = useLocale();
  const gleanClick = useGleanClick();

  const [searchIndex, searchIndexError, initializeSearchIndex] =
    useSearchIndex();

  const inputRef = useRef<null | HTMLInputElement>(null);
  const formRef = useRef<null | HTMLFormElement>(null);
  const isSelectionInitialized = useRef(false);

  const showIndexing = useHasNotChangedFor(inputValue, SHOW_INDEXING_AFTER_MS);

  useEffect(() => {
    if (!inputRef.current || isSelectionInitialized.current) {
      return;
    }
    if (isFocused) {
      inputRef.current.selectionStart = defaultSelection[0];
      inputRef.current.selectionEnd = defaultSelection[1];
    }
    isSelectionInitialized.current = true;
  }, [isFocused, defaultSelection]);

  const resultItems: ResultItem[] = useMemo(() => {
    if (!searchIndex || !inputValue || searchIndexError) {
      // This can happen if the initialization hasn't completed yet or
      // completed un-successfully.
      return [];
    }

    // The iPhone X series is 812px high.
    // If the window isn't very high, show fewer matches so that the
    // overlaying search results don't trigger a scroll.
    const limit = window.innerHeight < 850 ? 5 : 10;

    const inputValueLC = inputValue.toLowerCase().trim();
    const q = splitQuery(inputValue);
    const indexResults = searchIndex.flex
      .filter(([_, title]) => q.every((q) => title.includes(q)))
      .map(([index, title, slugTail]) => {
        const exact = Number([title, slugTail].includes(inputValueLC));
        return [exact, index];
      })
      .sort(([aExact], [bExact]) => bExact - aExact) // Boost exact matches.
      .map(([_, i]) => i)
      .slice(0, limit);

    return indexResults.map(
      (index: number) => (searchIndex.items || [])[index] as ResultItem
    );
  }, [inputValue, searchIndex, searchIndexError]);

  const formAction = `/${locale}/search`;
  const searchPath = useMemo(() => {
    const sp = new URLSearchParams();
    sp.set("q", inputValue.trim());
    return `${formAction}?${sp.toString()}`;
  }, [formAction, inputValue]);

  const nothingFoundItem = useMemo(
    () => ({ url: searchPath, title: "", positions: new Set() }),
    [searchPath]
  );

  const onlineSearch = useMemo(
    () => ({ url: searchPath, title: "", positions: new Set() }),
    [searchPath]
  );

  const resultClick: React.MouseEventHandler<HTMLAnchorElement> = () => {
    gleanClick(quicksearchPing(`${inputValue} ${id}`));
  };

  const {
    getInputProps,
    getItemProps,
    getMenuProps,

    highlightedIndex,
    isOpen,

    reset,
    toggleMenu,
  } = useCombobox({
    id: id,
    items:
      resultItems.length === 0
        ? [nothingFoundItem]
        : [...resultItems, onlineSearch],
    inputValue,
    isOpen: isFocused,
    defaultIsOpen: isFocused,
    defaultHighlightedIndex: 0,
    stateReducer: (state, { type, changes }) => {
      // https://github.com/downshift-js/downshift/tree/v7.6.0/src/hooks/useCombobox#statereducer
      // this prevents the menu from being closed when the user selects an item with 'Enter' or mouse
      switch (type) {
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
        case useCombobox.stateChangeTypes.ItemClick:
          return {
            ...changes, // default Downshift new state changes on item selection.
            isOpen: state.isOpen, // but keep menu open.
            highlightedIndex: state.highlightedIndex, // with the item highlighted.
          };
        default:
          return changes; // otherwise business as usual.
      }
    },
  });

  useFocusViaKeyboard(inputRef);

  useEffect(() => {
    if (isFocused) {
      initializeSearchIndex();
      onChangeIsFocused(true);
      inputRef.current?.focus();
    }
  }, [initializeSearchIndex, isFocused, onChangeIsFocused]);

  const [resultsWithHighlighting, setResultsWithHighlighting] = useState<any>(
    []
  );

  useEffect(() => {
    const item = resultItems[highlightedIndex];
    if (item && preloadSupported()) {
      const timeout = setTimeout(() => {
        preload(`${item.url}`);
      }, PRELOAD_WAIT_MS);
      return () => {
        clearTimeout(timeout);
      };
    }
  }, [highlightedIndex, resultItems]);

  useEffect(() => {
    setResultsWithHighlighting(
      resultItems.map((item) => {
        return (
          <>
            <HighlightMatch title={item.title} q={inputValue} />
            <br />
            <BreadcrumbURI uri={item.url} positions={item.positions} />
          </>
        );
      })
    );
  }, [resultItems, inputValue]);

  const searchResults = (() => {
    if (!isOpen || !inputValue.trim()) {
      return null;
    }

    if (searchIndexError) {
      return (
        <div className="searchindex-error result-item">
          <span>Failed to load search index!</span>
        </div>
      );
    }

    if (!searchIndex) {
      return showIndexing ? (
        <div className="indexing-warning result-item">
          <em>Loading search index...</em>
        </div>
      ) : null;
    }
    return (
      <>
        {resultItems.length === 0 && inputValue !== "/" ? (
          <div
            {...getItemProps({
              className:
                "nothing-found result-item " +
                (highlightedIndex === 0 ? "highlight" : ""),
              item: nothingFoundItem,
              index: 0,
            })}
          >
            <a
              href={searchPath}
              onClick={resultClick}
              onAuxClick={resultClick}
              tabIndex={-1}
            >
              No document titles found.
              <br />
              Site search for <code>{inputValue}</code>
            </a>
          </div>
        ) : (
          [
            ...resultItems.map((item, i) => (
              <div
                {...getItemProps({
                  key: item.url,
                  className: `result-item ${
                    i === highlightedIndex ? "highlight " : ""
                  }`,
                  item,
                  index: i,
                })}
              >
                <a
                  href={item.url}
                  onClick={resultClick}
                  onAuxClick={resultClick}
                  tabIndex={-1}
                >
                  {resultsWithHighlighting[i]}
                </a>
              </div>
            )),
            <div
              {...getItemProps({
                className:
                  "nothing-found result-item " +
                  (highlightedIndex === resultItems.length ? "highlight" : ""),
                key: "nothing-found",
                item: onlineSearch,
                index: resultItems.length,
              })}
            >
              <a
                href={searchPath}
                onClick={resultClick}
                onAuxClick={resultClick}
                tabIndex={-1}
              >
                Not seeing what you're searching for?
                <br />
                Site search for <code>{inputValue}</code>
              </a>
            </div>,
          ]
        )}
      </>
    );
  })();

  return (
    <form
      action={formAction}
      ref={formRef as any} // downshift's types hardcode it as a div
      className={"search-form search-widget"}
      id={formId}
      role={"search"}
      onSubmit={(e) => {
        // This comes into effect if the input is completely empty and the
        // user hits Enter, which triggers the native form submission.
        // When something *is* entered, the onKeyDown event is triggered
        // on the <input> and within that handler you can
        // access `event.key === 'Enter'` as a signal to submit the form.
        if (!inputValue.trim()) {
          e.preventDefault();
        }
      }}
      onFocus={() => onChangeIsFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          // focus has moved outside of container
          onChangeIsFocused(false);
        }
      }}
    >
      <label
        id={`${id}-label`}
        htmlFor={`${id}-input`}
        className="visually-hidden"
      >
        Search MDN
      </label>

      <input
        {...getInputProps({
          type: "search",
          className: isOpen
            ? "has-search-results search-input-field"
            : "search-input-field",
          name: "q",
          onMouseOver: initializeSearchIndex,
          onKeyDown(event) {
            if (event.key === "Escape" && inputRef.current) {
              onChangeInputValue("");
              reset();
              toggleMenu();
              inputRef.current?.blur();
            } else if (event.key === "Enter") {
              if (inputValue.trim() && highlightedIndex === -1) {
                inputRef.current!.blur();
                formRef.current!.submit();
              } else {
                const { ctrlKey, shiftKey, altKey, metaKey } = event;
                document
                  .querySelector<HTMLAnchorElement>(
                    `#${id}-item-${highlightedIndex} a`
                  )
                  ?.dispatchEvent(
                    new MouseEvent("click", {
                      // so react receives the event:
                      bubbles: true,
                      // we attempt to pass modifier keys through
                      // but browser support is incredibly varied:
                      ctrlKey,
                      shiftKey,
                      altKey,
                      metaKey,
                    })
                  );
              }
            }
          },
          onChange(event) {
            if (event.target instanceof HTMLInputElement) {
              onChangeInputValue(event.target.value);
            }
          },
          ref: (input) => {
            inputRef.current = input;
          },
          placeholder: "   ",
          required: true,
        })}
      />

      <Button
        type="action"
        icon="cancel"
        extraClasses="clear-search-button"
        onClickHandler={() => onChangeInputValue("")}
      >
        <span className="visually-hidden">Clear search input</span>
      </Button>

      <Button
        type="action"
        icon="search"
        buttonType="submit"
        extraClasses="search-button"
      >
        <span className="visually-hidden">Search</span>
      </Button>

      <div {...getMenuProps()}>
        {searchResults && <div className="search-results">{searchResults}</div>}
      </div>
    </form>
  );
}

class SearchErrorBoundary extends React.Component<{
  children?: React.ReactNode;
}> {
  state = { hasError: false };

  static getDerivedStateFromError(error: Error) {
    console.error("There was an error while trying to render search", error);
    return { hasError: true };
  }
  render() {
    return this.state.hasError ? (
      <div>Error while rendering search. Check console for details.</div>
    ) : (
      this.props.children
    );
  }
}

export default function SearchNavigateWidget(props) {
  return (
    <SearchErrorBoundary>
      <InnerSearchNavigateWidget {...props} />
    </SearchErrorBoundary>
  );
}
