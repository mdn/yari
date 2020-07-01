// @ts-nocheck
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FlexSearch from "flexsearch";
import FuzzySearch from "./fuzzy-search";
import "./search.scss";

function isMobileUserAgent() {
  return (
    typeof window !== "undefined" &&
    (typeof window.orientation !== "undefined" ||
      navigator.userAgent.indexOf("IEMobile") !== -1)
  );
}

function useFocusOnSlash(input: HTMLInputElement | null) {
  useEffect(() => {
    function focusOnSearchMaybe(event) {
      // Don't do this if the current event target is a widget
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
  }, [input]);
}

export function SearchNavigateWidget() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  useFocusOnSlash(inputRef.current);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <SearchWidget
        inputRef={inputRef}
        pathname={pathname}
        value={query}
        onChange={(value) => setQuery(value)}
        onSelect={(url) => {
          navigate(url);
          setQuery("");
        }}
      />
    </form>
  );
}

const ACTIVE_PLACEHOLDER = "Go ahead. Type your search...";
const INITIALIZING_PLACEHOLDER = "Initializing search...";
// Make this one depend on figuring out if you're on a mobile device
// because there you can't really benefit from keyboard shortcuts.
const INACTIVE_PLACEHOLDER = isMobileUserAgent()
  ? "Site search..."
  : 'Site search... (Press "/" to focus)';

// TODO the only reason exporting this, for now, is to make
// jest tests pass until https://github.com/mdn/yari/pull/494
// is resolved.
export class SearchWidget extends React.Component<{
  value: string;
  pathname?: string;
  onChange: (url: string) => unknown;
  inputRef: React.RefObject<HTMLInputElement>;
  onSelect?: (url: string) => unknown;
  onValueExistsChange?: (exists: boolean) => unknown;
}> {
  static defaultProps = {
    inputRef: React.createRef(null),
  };

  state = {
    highlitResult: null,
    initialized: null, // null=not started, false=started, true=finished
    searchResults: [],
    serverError: null,
    showSearchResults: false,
  };

  getCurrentLocale = () => {
    return (
      (this.props.pathname && this.props.pathname.split("/")[1]) || "en-US"
    );
  };

  componentDidUpdate(prevProps) {
    if (prevProps.pathname !== this.props.pathname) {
      // Hide search results if you changed page.
      if (this.state.showSearchResults || this.state.q) {
        this.setState({
          highlitResult: null,
          q: "",
          showSearchResults: false,
          locale: this.props.pathname.split("/")[1] || "en-US",
        });
      }
    }

    if (prevProps.value !== this.props.value) {
      this.updateSearch();
    }
  }

  componentWillUnmount() {
    this.dismounted = true;
  }

  initializeIndex = () => {
    if (this.state.initialized !== null) {
      // Been initialized, or started to, at least once before.
      return;
    }

    this.setState({ initialized: false }, async () => {
      // Always do the XHR network request (hopefully good HTTP caching
      // will make this pleasant for the client) but localStorage is
      // always faster than XHR even with localStorage's flaws.
      const localStorageCacheKey = `${this.getCurrentLocale()}-titles`;
      const storedTitlesRaw = localStorage.getItem(localStorageCacheKey);
      if (storedTitlesRaw) {
        let storedTitles = null;
        try {
          storedTitles = JSON.parse(storedTitlesRaw);
        } catch (ex) {
          console.warn(ex);
        }
        // XXX Could check the value of 'storedTitles._fetchDate'.
        // For example if `new Date().getTime() - storedTitles._fetchDate`
        // is a really small number, it probably just means the page was
        // refreshed very recently.
        if (storedTitles) {
          this.indexTitles(storedTitles);
          this.setState({ initialized: true });
        }
      }

      let response;
      try {
        response = await fetch(`/${this.getCurrentLocale()}/titles.json`);
      } catch (ex) {
        if (this.dismounted) return;
        return this.setState({ serverError: ex, showSearchResults: true });
      }
      if (this.dismounted) return;
      if (!response.ok) {
        return this.setState({
          serverError: response,
          showSearchResults: true,
        });
      }
      const { titles } = await response.json();
      this.indexTitles(titles);
      this.setState({ initialized: true });

      // So we can keep track of how old the data is when stored
      // in localStorage.
      titles._fetchDate = new Date().getTime();
      try {
        localStorage.setItem(
          `${this.getCurrentLocale()}-titles`,
          JSON.stringify(titles)
        );
      } catch (ex) {
        console.warn(
          ex,
          `Unable to store a ${JSON.stringify(titles).length} string`
        );
      }
    });
  };

  indexTitles = (titles) => {
    // NOTE! See search-experimentation.js to play with different settings.
    this.index = new FlexSearch({
      suggest: true,
      // tokenize: "reverse",
      tokenize: "forward",
    });
    this._map = titles;

    const urisSorted = [];
    Object.entries(titles)
      .sort((a, b) => b[1].popularity - a[1].popularity)
      .forEach(([uri, info]) => {
        // XXX investigate if it's faster to add all at once
        // https://github.com/nextapps-de/flexsearch/#addupdateremove-documents-tofrom-the-index
        this.index.add(uri, info.title);
        urisSorted.push(uri);
      });
    this.fuzzySearcher = new FuzzySearch(urisSorted);
  };

  updateSearch = () => {
    const { value, onValueExistsChange } = this.props;
    if (!value) {
      if (this.state.showSearchResults) {
        this.setState({ showSearchResults: false });
      }
      return;
    } else if (!this.index) {
      // This can happen if the initialized hasn't completed yet or
      // completed un-successfully.
      return;
    }

    // The iPhone X series is 812px high.
    // If the window isn't very high, show fewer matches so that the
    // overlaying search results don't trigger a scroll.
    const limit = window.innerHeight < 850 ? 5 : 10;

    let results = null;
    if (value.startsWith("/") && !/\s/.test(value)) {
      // Fuzzy-String search on the URI

      if (value === "/") {
        this.setState({
          highlitResult: null,
          searchResults: [],
          showSearchResults: true,
        });
      } else {
        const fuzzyResults = this.fuzzySearcher.search(value, { limit });
        results = fuzzyResults.map((fuzzyResult) => ({
          title: this._map[fuzzyResult.needle].title,
          uri: fuzzyResult.needle,
          substrings: fuzzyResult.substrings,
        }));
      }
    } else {
      // Full-Text search
      const indexResults = this.index.search(value, {
        limit,
        // bool: "or",
        suggest: true, // This can give terrible result suggestions
      });

      results = indexResults.map((uri) => ({
        title: this._map[uri].title,
        uri,
        popularity: this._map[uri].popularity,
      }));
    }

    if (results) {
      onValueExistsChange &&
        onValueExistsChange(
          results.some((item) => item.uri.toLowerCase() === value.toLowerCase())
        );
      this.setState({
        highlitResult: results.length ? 0 : null,
        searchResults: results,
        showSearchResults: true,
      });
    } else {
      onValueExistsChange && onValueExistsChange(false);
    }
  };

  keyDownHandler = (event) => {
    if (event.key === "Enter") {
      this.submitHandler();
    } else if (event.key === "Escape") {
      if (this.state.showSearchResults) {
        this.setState({ showSearchResults: false });
      } else {
        // If there's nothing left in the input field, force a blur.
        // The reason for doing this is that you might have used
        // a keyboard shortcut to trigger focus on the input field
        // and there's no way to escape that focus.
        if (!this.state.q) {
          this.blurHandler();
          if (this.inputRef.current) {
            this.inputRef.current.blur();
          }
        }
      }
    } else if (event.key === "ArrowDown" || event.key === "Tab") {
      // Increment 'highlitResult' if possible.
      const { highlitResult, searchResults } = this.state;
      if (highlitResult === null) {
        if (searchResults.length) {
          event.preventDefault();
          this.setState({ highlitResult: 0 });
        }
      } else if (highlitResult < searchResults.length - 1) {
        event.preventDefault();
        this.setState({ highlitResult: highlitResult + 1 });
      }
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      // Decrement 'highlitResult' if possible.
      const { highlitResult } = this.state;
      if (highlitResult > 0) {
        this.setState({ highlitResult: highlitResult - 1 });
      } else {
        this.setState({ highlitResult: 0 });
      }
    }
  };

  focusHandler = () => {
    // If it hasn't been done already, do this now. It's idempotent.
    this.initializeIndex();

    // Perhaps the blur closed the search results
    const { searchResults, showSearchResults } = this.state;
    if (!showSearchResults && searchResults.length && this.props.value) {
      this.setState({ showSearchResults: true });
    }

    // If you're on a mobile, scroll down a little bit so that the search
    // bar is at the top of your screen. That allows maximum height space
    // usage to fix the input widget, the search result suggestions, and
    // the keyboard.
    const isSmallerScreen = isMobileUserAgent() && window.innerHeight < 850;
    if (isSmallerScreen && !this._hasScrolledDown) {
      if (this.props.inputRef.current) {
        this.props.inputRef.current.scrollIntoView();
      }
      // Don't bother a second time.
      this._hasScrolledDown = true;
    }
  };

  blurHandler = () => {
    // The reason we have a slight delay before hiding search results
    // is so that any onClick on the results get a chance to fire.
    this.hideSoon = window.setTimeout(() => {
      if (!this.dismounted) {
        this.setState({ showSearchResults: false });
      }
    }, 200);
  };

  submitHandler = () => {
    const { onSelect, onChange } = this.props;
    const { highlitResult, searchResults } = this.state;
    let uri = null;
    if (searchResults.length === 1) {
      uri = searchResults[0].uri;
    } else if (searchResults.length && highlitResult !== null) {
      uri = searchResults[highlitResult].uri;
    }
    if (uri) {
      onChange(uri);
      onSelect && onSelect(uri);
      this.setState({
        showSearchResults: false,
      });
    }
  };

  render() {
    const { value } = this.props;
    const {
      highlitResult,
      searchResults,
      serverError,
      showSearchResults,
      initialized,
    } = this.state;

    // The fuzzy search is engaged if the search term starts with a '/'
    // and does not have any spaces in it.
    const isFuzzySearch = value.startsWith("/") && !/\s/.test(value);

    // Compute this once so it can be used as a conditional
    // and a prop.
    // Nothing found means there was an attempt to find stuff but it
    // came back empty.
    const nothingFound =
      (value && !searchResults.length && !isFuzzySearch) ||
      (isFuzzySearch && value !== "/" && !searchResults.length);

    // This boolean determines if we should bother to show the search
    // results div at all.
    // It's best to know this BEFORE instead of letting
    // the <ShowSearchResults/> component return a null.
    // By knowing it in advance we can use it as a hint to the input widget
    // so it can know to draw a bottom border or not.
    const show =
      !serverError &&
      showSearchResults &&
      (nothingFound || searchResults.length || isFuzzySearch);

    return (
      <div className="search-widget">
        <input
          className={show ? "has-search-results" : null}
          onBlur={this.blurHandler}
          onChange={(event) => {
            this.props.onChange(event.target.value);
          }}
          onFocus={this.focusHandler}
          onKeyDown={this.keyDownHandler}
          onMouseOver={this.initializeIndex}
          placeholder={
            initialized === null
              ? INACTIVE_PLACEHOLDER
              : initialized
              ? ACTIVE_PLACEHOLDER
              : INITIALIZING_PLACEHOLDER
          }
          ref={this.props.inputRef}
          type="search"
          value={value}
        />
        {serverError && (
          <p className="server-error">
            {/* XXX Could be smarter here and actually *look* at the serverError object */}
            Server error trying to initialize index
          </p>
        )}
        {show ? (
          <ShowSearchResults
            highlitResult={highlitResult}
            nothingFound={nothingFound}
            q={value}
            onSelect={(url) => {
              const { onChange, onSelect } = this.props;
              onChange(url);
              onSelect && onSelect(url);
            }}
            results={searchResults}
            isFuzzySearch={isFuzzySearch}
          />
        ) : null}
      </div>
    );
  }
}

function ShowSearchResults({
  onSelect,
  highlitResult,
  isFuzzySearch,
  nothingFound,
  q,
  results,
}) {
  return (
    <div className="search-results">
      {nothingFound && <div className="nothing-found">nothing found</div>}
      {results.map((result, i) => {
        return (
          <div
            className={i === highlitResult ? "highlit" : null}
            key={result.uri}
            onClick={() => onSelect(result.uri)}
          >
            <HighlightMatch title={result.title} q={q} />
            <br />
            <BreadcrumbURI uri={result.uri} substrings={result.substrings} />
          </div>
        );
      })}
      {isFuzzySearch && (
        <div className="fuzzy-engaged">Fuzzy searching by URI</div>
      )}
    </div>
  );
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
