import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCombobox } from "downshift";
import FlexSearch from "flexsearch";
import useSWR from "swr";
import FuzzySearch from "./fuzzy-search";
import "./search.scss";

import { useLocale } from "./hooks";
import SearchIcon from "./kumastyles/general/search.svg";

function isMobileUserAgent() {
  return (
    typeof window !== "undefined" &&
    (typeof window.orientation !== "undefined" ||
      navigator.userAgent.indexOf("IEMobile") !== -1)
  );
}

const INITIALIZING_PLACEHOLDER = "Initializing search...";
const ACTIVE_PLACEHOLDER = "Go ahead. Type your search...";
// Make this one depend on figuring out if you're on a mobile device
// because there you can't really benefit from keyboard shortcuts.
const INACTIVE_PLACEHOLDER = isMobileUserAgent()
  ? "Site search..."
  : 'Site search... (Press "/" to focus)';

type Titles = {
  [url: string]: {
    title: string;
    popularity: number;
  };
};

type SearchIndex = {
  flex: any;
  fuzzy: FuzzySearch;
  titles: Titles;
};

function useSearchIndex(): [null | SearchIndex, null | Error, () => void] {
  const [shouldInitialize, setShouldInitialize] = useState(false);
  const [searchIndex, setSearchIndex] = useState<null | SearchIndex>(null);
  const locale = useParams().locale || "en-US";

  const url = `/${locale}/titles.json`;
  const { error, data: titles } = useSWR<Titles>(
    shouldInitialize ? url : null,
    async (url) => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(await response.text());
      }
      const { titles } = await response.json();
      return titles;
    },
    { revalidateOnFocus: false }
  );

  useEffect(() => {
    if (!titles) {
      return;
    }
    const flex = new (FlexSearch as any)({
      suggest: true,
      tokenize: "forward",
    });
    const urisSorted = Object.entries(titles)
      .sort((a, b) => b[1].popularity - a[1].popularity)
      .map(([uri, info]) => {
        // XXX investigate if it's faster to add all at once
        // https://github.com/nextapps-de/flexsearch/#addupdateremove-documents-tofrom-the-index
        flex.add(uri, info.title);
        return uri;
      });
    const fuzzy = new FuzzySearch(urisSorted);

    setSearchIndex({ flex, fuzzy, titles });
  }, [shouldInitialize, titles, url]);

  return [searchIndex, error, () => setShouldInitialize(true)];
}

// The fuzzy search is engaged if the search term starts with a '/'
// and does not have any spaces in it.
function isFuzzySearchString(str: string) {
  return str.startsWith("/") && !/\s/.test(str);
}

function HighlightMatch({ title, q }) {
  // FlexSearch doesn't support finding out which "typo corrections"
  // were done unfortunately.
  // See https://github.com/nextapps-de/flexsearch/issues/99

  // Split on higlight term and include term into parts, ignore case.
  const words = q.trim().toLowerCase().split(/[ ,]+/);

  // $& means the whole matched string
  const regexWords = words.map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const regex = `\\b(${regexWords.join("|")})`;
  const parts = title.split(new RegExp(regex, "gi"));
  return (
    <b>
      {parts.map((part, i) => {
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

function BreadcrumbURI({ uri, substrings }) {
  if (substrings) {
    return (
      <small>
        {substrings.map((part, i) => {
          const key = `${part.str}:${i}`;
          if (part.match) {
            return <mark key={key}>{part.str}</mark>;
          } else {
            return <span key={key}>{part.str}</span>;
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

type ResultItem = {
  title: string;
  uri: string;
  popularity: any;
  substrings: string[];
};

function useFocusOnSlash(inputRef: React.RefObject<null | HTMLInputElement>) {
  useEffect(() => {
    function focusOnSearchMaybe(event) {
      const input = inputRef.current;
      if (
        event.code === "Slash" &&
        !["TEXTAREA", "INPUT"].includes(event.target.tagName)
      ) {
        if (input && document.activeElement !== input) {
          event.preventDefault();
          input.focus();
        }
      }
    }
    document.addEventListener("keydown", focusOnSearchMaybe);
    return () => {
      document.removeEventListener("keydown", focusOnSearchMaybe);
    };
  }, [inputRef]);
}

function InnerSearchNavigateWidget() {
  const navigate = useNavigate();
  const locale = useLocale();

  const [
    searchIndex,
    searchIndexError,
    initializeSearchIndex,
  ] = useSearchIndex();
  const [resultItems, setResultItems] = useState<ResultItem[]>([]);
  const [isFocused, setIsFocused] = useState(false);

  const inputRef = useRef<null | HTMLInputElement>(null);

  const updateResults = useCallback(
    (inputValue: string | undefined) => {
      if (!searchIndex || !inputValue) {
        // This can happen if the initialized hasn't completed yet or
        // completed un-successfully.
        setResultItems([]);
        return;
      }

      // The iPhone X series is 812px high.
      // If the window isn't very high, show fewer matches so that the
      // overlaying search results don't trigger a scroll.
      const limit = window.innerHeight < 850 ? 5 : 10;

      let results = null;
      if (isFuzzySearchString(inputValue)) {
        if (inputValue === "/") {
          setResultItems([]);
          return;
        } else {
          const fuzzyResults = searchIndex.fuzzy.search(inputValue, { limit });
          results = fuzzyResults.map((fuzzyResult) => ({
            title: searchIndex.titles[fuzzyResult.needle].title,
            uri: fuzzyResult.needle,
            substrings: fuzzyResult.substrings,
          }));
        }
      } else {
        // Full-Text search
        const indexResults = searchIndex.flex.search(inputValue, {
          limit,
          suggest: true, // This can give terrible result suggestions
        });

        results = indexResults.map((uri) => ({
          title: searchIndex.titles[uri].title,
          uri,
          popularity: searchIndex.titles[uri].popularity,
        }));
      }

      if (results) {
        setResultItems(results);
      }
    },
    [searchIndex, setResultItems]
  );

  const {
    getInputProps,
    getItemProps,
    getMenuProps,
    getComboboxProps,

    highlightedIndex,
    inputValue,
    isOpen,

    reset,
  } = useCombobox({
    defaultHighlightedIndex: 0,
    items: resultItems,
    onInputValueChange: ({ inputValue }) => {
      updateResults(inputValue);
    },
    onSelectedItemChange: ({ selectedItem }) => {
      if (selectedItem) {
        navigate(selectedItem.uri);
        reset();
      }
    },
  });

  useFocusOnSlash(inputRef);

  const showResults = isOpen || searchIndexError;

  return (
    <form
      action={`/${locale}/search`}
      {...getComboboxProps({
        className: "search-widget",
        id: "nav-main-search",
        role: "search",
        // onSubmit: (e) => {
        //   e.preventDefault();
        // },
      })}
    >
      <img src={SearchIcon} alt="search" className="search-icon" />

      <label htmlFor="main-q" className="visually-hidden">
        Search MDN
      </label>

      <input
        {...getInputProps({
          type: "search",
          className: isOpen
            ? "has-search-results search-input-field"
            : "search-input-field",
          id: "main-q",
          name: "q",
          placeholder: isFocused
            ? searchIndex
              ? ACTIVE_PLACEHOLDER
              : INITIALIZING_PLACEHOLDER
            : INACTIVE_PLACEHOLDER,
          onMouseOver: initializeSearchIndex,
          onFocus: () => {
            initializeSearchIndex();
            setIsFocused(true);
          },
          onBlur: () => setIsFocused(false),
          onKeyDown: (event) => {
            if (event.key === "Escape" && inputRef.current) {
              inputRef.current.blur();
            }
          },
          ref: (input) => {
            inputRef.current = input;
          },
        })}
      />

      <div {...getMenuProps()}>
        {showResults && (
          <div className="search-results">
            {searchIndexError ? (
              <div className="searchindex-error">
                Error initializing search index
              </div>
            ) : resultItems.length === 0 && inputValue ? (
              <div className="nothing-found">nothing found</div>
            ) : null}
            {resultItems.map((item, i) => (
              <div
                {...getItemProps({
                  key: item.uri,
                  className: i === highlightedIndex ? "highlit" : undefined,
                  item,
                  index: i,
                })}
              >
                <HighlightMatch title={item.title} q={inputValue} />
                <br />
                <BreadcrumbURI uri={item.uri} substrings={item.substrings} />
              </div>
            ))}
            {isFuzzySearchString(inputValue) && (
              <div className="fuzzy-engaged">Fuzzy searching by URI</div>
            )}
          </div>
        )}
      </div>
    </form>
  );
}

class SearchErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
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

export function SearchNavigateWidget() {
  return (
    <SearchErrorBoundary>
      <InnerSearchNavigateWidget />
    </SearchErrorBoundary>
  );
}
