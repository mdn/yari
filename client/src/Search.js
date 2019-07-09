import React from "react";
import { Link } from "react-router-dom";
import FlexSearch from "flexsearch";
import "./Search.scss";

export class SearchWidget extends React.Component {
  state = {
    q: "",
    lastQ: "",
    initializing: false,
    serverError: null,
    searchResults: [],
    showSearchResults: true,
    highlitResult: null
  };

  componentDidMount() {
    // XXX set up listener event for ESCAPE?
  }

  componentDidUpdate(prevProps) {
    if (prevProps.pathname !== this.props.pathname) {
      // console.log("PATHNAME CHANGED!");
      // Hide search results if you changed page.
      if (this.state.showSearchResults || this.state.q) {
        this.setState({ showSearchResults: false, q: "", lastQ: "" });
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
        return this.setState({ serverError: ex });
      }
      if (this.dismounted) return;
      if (!response.ok) {
        return this.setState({ serverError: response });
      }
      const titles = await response.json();

      // XXX support locales!
      // NOTE! See search-experimentation.js to play with different settings.
      this.index = new FlexSearch({
        encode: "advanced",
        tokenize: "reverse",
        suggest: true
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

        const indexResults = this.index.search(q, 10);
        const results = indexResults.map(uri => {
          return { uri, title: this._map[uri] };
        });
        this.setState({
          lastQ: q,
          showSearchResults: results.length > 0,
          searchResults: results
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
    }
  };

  submitHandler = event => {
    event.preventDefault();
    console.warn("If there is a good first suggestion, redirect to that");
  };

  redirect = uri => {
    // XXX
  };

  render() {
    const { serverError, showSearchResults, searchResults, q } = this.state;
    return (
      <form onSubmit={this.submitHandler} className="search-widget">
        <input
          type="search"
          value={q}
          onChange={this.searchHandler}
          placeholder="Site search"
          onMouseOver={this.initializeIndex}
          onFocus={this.initializeIndex}
          onKeyDown={this.keyDownHandler}
        />
        {serverError && (
          <p>
            <small>Server error trying to initialize index :(</small>
          </p>
        )}
        {!serverError && showSearchResults && searchResults.length ? (
          <ShowSearchResults results={searchResults} redirect={this.redirect} />
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
    const { results } = this.props;
    return (
      <div className="search-results">
        {results.map(result => {
          return (
            <div
              key={result.uri}
              onClick={event => this.redirectHandler(result)}
            >
              <b>{result.title}</b>
              {/* <Link to={result.uri} onClick={event => event.preventDefault()}>
                {result.title}
              </Link> */}
            </div>
          );
        })}
      </div>
    );
  }
}
