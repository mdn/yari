import FlexSearch from "flexsearch";
import React from "react";
import { Redirect } from "react-router-dom";
import "./Search.scss";

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
      let response;
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

      // XXX support locales!
      // NOTE! See search-experimentation.js to play with different settings.
      this.index = new FlexSearch({
        encode: "advanced",
        suggest: true,
        // tokenize: "reverse",
        tokenize: "forward"
      });
      this._map = {};
      Object.entries(titles).forEach(([uri, title]) => {
        this._map[uri] = title;
        this.index.add(uri, title);
      });
    });
  };

  searchHandler = event => {
    this.setState({ q: event.target.value }, () => {
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
        console.log(
          `Do something interesting with ${this.state.q.trim()} (last search: ${
            this.state.lastQ
          })`
        );
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

        if (this.hideSoon) {
          // You have triggered the hideSoon timeout which usually happens
          // when you blur the input. But clearly you've changed your mind
          // and typed something new interesting in. So cancel that timeout.
          window.clearTimeout(this.hideSoon);
        }

        const indexResults = this.index.search(q, 10);
        const results = indexResults.map(uri => {
          return { title: this._map[uri], uri };
        });
        this.setState({
          lastQ: q,
          searchResults: results,
          showSearchResults: true
        });
      }
    });
  };

  keyDownHandler = event => {
    // console.log("keydown:", event.key);
    if (event.key === "Escape") {
      if (this.state.showSearchResults) {
        this.setState({ showSearchResults: false });
      }
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      // Increment 'highlitResult' if possible.
      const { highlitResult, searchResults } = this.state;
      if (highlitResult === null) {
        if (searchResults.length) {
          this.setState({ highlitResult: 0 });
        }
      } else if (highlitResult < searchResults.length - 1) {
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
    }
  };

  blurHandler = () => {
    this.hideSoon = window.setTimeout(() => {
      if (!this.dismounted) {
        this.setState({ showSearchResults: false });
      }
    }, 300);
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
    return (
      <form className="search-widget" onSubmit={this.submitHandler}>
        <input
          onBlur={this.blurHandler}
          onChange={this.searchHandler}
          onFocus={this.initializeIndex}
          onKeyDown={this.keyDownHandler}
          onMouseOver={this.initializeIndex}
          placeholder="Site search"
          type="search"
          value={q}
        />
        {serverError && (
          <p className="server-error">
            {/* XXX Could be smarter here and actually *look* at the serverError object */}
            Server error trying to initialize index
          </p>
        )}
        {!serverError && showSearchResults ? (
          <ShowSearchResults
            highlitResult={highlitResult}
            nothingFound={q && !searchResults.length}
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
    if (!nothingFound && !results.length) {
      return null;
    }
    return (
      <div className="search-results">
        {nothingFound && <div className="nothing-found">nothing found</div>}
        {results.map((result, i) => {
          return (
            <div
              className={i === highlitResult ? "highlit" : null}
              key={result.uri}
              onClick={event => this.redirectHandler(result)}
            >
              <b>{result.title}</b>
            </div>
          );
        })}
      </div>
    );
  }
}
