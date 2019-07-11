import FlexSearch from "flexsearch";
import React from "react";
import { Redirect } from "react-router-dom";
import "./Search.scss";

function isMobileUserAgent() {
  return (
    typeof window.orientation !== "undefined" ||
    navigator.userAgent.indexOf("IEMobile") !== -1
  );
}

export class SearchWidget extends React.Component {
  state = {
    highlitResult: null,
    initializing: false,
    lastQ: "",
    q: "",
    redirectTo: null,
    searchResults: [],
    serverError: null,
    showSearchResults: true
  };

  componentDidMount() {
    // XXX set up listener event for ESCAPE?
  }

  componentDidUpdate(prevProps) {
    if (prevProps.pathname !== this.props.pathname) {
      // console.log("PATHNAME CHANGED!");
      // Hide search results if you changed page.
      if (this.state.showSearchResults || this.state.q) {
        this.setState({
          highlitResult: null,
          lastQ: "",
          q: "",
          redirectTo: null,
          showSearchResults: false
        });
      }
    }
  }

  componentWillUnmount() {
    this.dismounted = true;
    // XXX tear down listener event for ESCAPE?
  }

  initializeIndex = () => {
    if (this.state.initializing) return;

    this.setState({ initializing: true }, async () => {
      // Always do the XHR network request (hopefully good HTTP caching
      // will make this pleasant for the client) but localStorage is
      // always faster than XHR even with localStorage's flaws.
      console.time("Fetching titles localStorage");
      const localStorageCacheKey = "titles";
      const storedTitlesRaw = localStorage.getItem(localStorageCacheKey);
      if (storedTitlesRaw) {
        let storedTitles = null;
        try {
          storedTitles = JSON.parse(storedTitlesRaw);
        } catch (ex) {
          console.warn(ex);
        }
        console.timeEnd("Fetching titles localStorage");
        // XXX Could check the value of 'storedTitles._fetchDate'.
        // For example if `new Date().getTime() - storedTitles._fetchDate`
        // is a really small number, it probably just means the page was
        // refreshed very recently.
        if (storedTitles) {
          this.indexTitles(storedTitles);
        }
      }

      let response;
      console.time("Fetching titles JSON");
      try {
        // XXX support locales!
        //
        response = await fetch("/titles.json");
      } catch (ex) {
        if (this.dismounted) return;
        return this.setState({ serverError: ex, showSearchResults: true });
      }
      if (this.dismounted) return;
      if (!response.ok) {
        return this.setState({
          serverError: response,
          showSearchResults: true
        });
      }
      const { titles } = await response.json();
      console.timeEnd("Fetching titles JSON");
      this.indexTitles(titles);

      // So we can keep track of how old the data is when stored
      // in localStorage.
      titles._fetchDate = new Date().getTime();
      // XXX support proper cache keys based on locales
      console.time("Store fetched titles in localStorage");
      try {
        localStorage.setItem("titles", JSON.stringify(titles));
      } catch (ex) {
        console.warn(
          ex,
          `Unable to store a ${JSON.stringify(titles).length} string`
        );
      }

      console.timeEnd("Store fetched titles in localStorage");
    });
  };

  indexTitles = titles => {
    console.time(`Indexing ${Object.keys(titles).length} titles`);
    // NOTE! See search-experimentation.js to play with different settings.
    this.index = new FlexSearch({
      encode: "advanced",
      suggest: true,
      // tokenize: "reverse",
      tokenize: "forward"
    });
    console.timeEnd(`Indexing ${Object.keys(titles).length} titles`);
    // console.timeEnd(`Indexing ${titles.length} titles`);
    this._map = {};
    Object.entries(titles).forEach(([uri, title]) => {
      this._map[uri] = title;
      this.index.add(uri, title);
    });
  };

  searchHandler = event => {
    this.setState({ q: event.target.value }, this.updateSearch);
  };

  updateSearch = () => {
    const q = this.state.q.trim();
    if (!q) {
      if (this.state.showSearchResults) {
        this.setState({ showSearchResults: false });
      }
    } else if (!this.index) {
      // This can happen if the initializing hasn't completed yet or
      // completed un-successfully.
      return;
    } else {
      // console.log(
      //   `Do something interesting with ${this.state.q.trim()} (last search: ${
      //     this.state.lastQ
      //   })`
      // );
      // // XXX we could compare this.state.q and this.state.lastQ
      // // since this.state.lastQ reflects the current results.
      // // IF nothing was found based on this.state.lastQ AND
      // // this.state.q.startsWith(this.state.lastQ)
      // // we know don't need to bother searching again.
      // console.log(
      //   "COMPARE",
      //   [this.state.q, this.state.lastQ],
      //   this.state.searchResults.length
      // );
      // if (
      //   this.state.lastQ &&
      //   this.state.q.startsWith(this.state.lastQ) &&
      //   !this.state.searchResults.length
      // ) {
      //   console.warn(
      //     `Nothing found for ${this.state.lastQ} so don't bother with ${
      //       this.state.q
      //     }`
      //   );
      //   return;
      // }

      // if (this.hideSoon) {
      //   // You have triggered the hideSoon timeout which usually happens
      //   // when you blur the input. But clearly you've changed your mind
      //   // and typed something new interesting in. So cancel that timeout.
      //   window.clearTimeout(this.hideSoon);
      // }

      console.time(`Search "${q}"`);
      const indexResults = this.index.search(q, {
        limit: isMobileUserAgent() ? 5 : 10,
        // bool: "or",
        suggest: true // This can give terrible result suggestions
      });
      console.timeEnd(`Search "${q}"`);

      const results = indexResults.map(uri => {
        return { title: this._map[uri], uri };
      });
      this.setState({
        highlitResult: null,
        lastQ: q,
        searchResults: results,
        showSearchResults: true
      });
    }
  };

  keyDownHandler = event => {
    // console.log("keydown:", event.key);
    if (event.key === "Escape") {
      if (this.state.showSearchResults) {
        this.setState({ showSearchResults: false });
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
        this.setState({ highlitResult: null });
      }
    } else if (event.key === "Tab") {
      // If the user tabbed, only try to control it if there is a good
      // reason to do so.
      // const {highlitResult, searchResults} =this.state;
      // if (highlitResult === null)
      // If the user tabbed, only try to control it if there is a good
      // "background q" to tab-complete to.
      // const backgroundQ = this.computeBackgroundQ(true);
      // if (backgroundQ) {
      //   event.preventDefault();
      //   this.setState({ q: backgroundQ }, this.updateSearch);
      //   // console.warn({ backgroundQ });
      // }
    }
  };

  focusHandler = () => {
    // If it hasn't been done already, do this now. It's idempotent.
    this.initializeIndex();

    // Perhaps the blur closed the search results
    const { q, searchResults, showSearchResults } = this.state;
    if (!showSearchResults && searchResults.length && q) {
      this.setState({ showSearchResults: true });
    }

    // If you're on a mobile, scroll down a little bit so that the search
    // bar is at the top of your screen. That allows maximum height space
    // usage to fix the input widget, the search result suggestions, and
    // the keyboard.
    if (isMobileUserAgent() && !this._has_scrolled_down) {
      if (this.inputRef.current) {
        this.inputRef.current.scrollIntoView();
      }
      // Don't bother a second time.
      this._has_scrolled_down = true;
    }
  };

  blurHandler = () => {
    if (!this.dismounted && this.state.showSearchResults) {
      this.setState({ showSearchResults: false });
    }
    // // How quickly to hide, on a blur depends on what's currently
    // // shown. For example, ...
    // this.hideSoon = window.setTimeout(() => {
    //   if (!this.dismounted) {
    //     this.setState({ showSearchResults: false });
    //   }
    // }, 100);
  };

  submitHandler = event => {
    event.preventDefault();
    const { highlitResult, searchResults } = this.state;
    // console.warn("If there is a good first suggestion, redirect to that");
    let redirectTo;
    if (searchResults.length === 1) {
      redirectTo = searchResults[0].uri;
    } else if (searchResults.length && highlitResult) {
      console.log(searchResults[highlitResult].uri);
      redirectTo = searchResults[highlitResult].uri;
    } else {
      return;
    }
    this.setState({
      redirectTo,
      showSearchResults: false
    });
  };

  redirect = uri => {
    this.setState({ redirectTo: uri });
  };

  // computeBackgroundQ = (caseInsensitive = false) => {
  //   // If there is a good new suggestion, add its full word to 'q'.
  //   const { q, highlitResult, searchResults } = this.state;
  //   if (!q) {
  //     return "";
  //   }
  //   let next;
  //   if (highlitResult !== null) {
  //     next = searchResults[highlitResult].title;
  //   } else if (searchResults.length) {
  //     next = searchResults[0].title;
  //   }

  //   // If the user has typed "jav" and the 'next' value is 'JavaScript'
  //   // we ultimately want to return and suggest 'javaScript'
  //   console.log({ next });
  //   // let regex
  //   if (caseInsensitive) {
  //     return next;
  //   }
  //   if (next) {
  //     return q + next.replace(new RegExp(q, "i"), "");
  //   }

  //   return q;
  // };

  // This exists to avoid having to use 'document.querySelector(...)'
  // to get to the DOM element.
  inputRef = React.createRef();

  render() {
    const {
      highlitResult,
      q,
      redirectTo,
      searchResults,
      serverError,
      showSearchResults
    } = this.state;
    if (redirectTo) {
      return <Redirect push to={redirectTo} />;
    }

    // Compute this once so it can be used as a conditional
    // and a prop.
    // Nothing found means there was an attempt to find stuff but it
    // came back empty.
    const nothingFound = q && !searchResults.length;

    // This boolean determines if we should bother to show the search
    // results div at all.
    // It's best to know this BEFORE instead of letting
    // the <ShowSearchResults/> component return a null.
    // By knowing it in advance we can use it as a hint to the input widget
    // so it can know to draw a bottom border or not.
    const show =
      !serverError &&
      showSearchResults &&
      (nothingFound || searchResults.length);

    return (
      <form className="search-widget" onSubmit={this.submitHandler}>
        {/* <div className="input-wrapper">
          <input
            type="search"
            className={show ? "background has-search-results" : "background"}
            readOnly
            value={this.computeBackgroundQ()}
          /> */}
        <input
          ref={this.inputRef}
          onBlur={this.blurHandler}
          onChange={this.searchHandler}
          onFocus={this.focusHandler}
          onKeyDown={this.keyDownHandler}
          onMouseOver={this.initializeIndex}
          placeholder="Site search"
          type="search"
          value={q}
          className={show ? "has-search-results" : null}
        />
        {/* </div> */}
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
            redirect={this.redirect}
            results={searchResults}
          />
        ) : null}
      </form>
    );
  }
}

class ShowSearchResults extends React.PureComponent {
  redirectHandler = result => {
    console.log(`Redirect to ${result.uri}?`);
    this.props.redirect(result.uri);
  };

  render() {
    const { highlitResult, nothingFound, results } = this.props;
    // if (!nothingFound && !results.length) {
    //   console.warn("EVER!");

    //   return null;
    // }
    return (
      <div className="search-results">
        {nothingFound && <div className="nothing-found">nothing found</div>}
        {results.map((result, i) => {
          // XXX not sure I want to keep this since it should probably be
          // implicit what locale you've already loaded.
          // However if you *prefer* French and there is nothing found
          // for what you were looking for, perhaps it'd be nice to see
          // the en-US version (and to know that it was only the en-US one
          // found).
          let locale = null;
          locale = result.uri.split("/")[2];

          return (
            <div
              className={i === highlitResult ? "highlit" : null}
              key={result.uri}
              onClick={event => this.redirectHandler(result)}
            >
              <b>{result.title}</b> {locale && <small>({locale})</small>}
            </div>
          );
        })}
      </div>
    );
  }
}
