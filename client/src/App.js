import React from "react";
import { Redirect, Route, Switch, Link } from "react-router-dom";

const LOCALES = ["en-US"];

function App(appProps) {
  return (
    <div>
      <Route path="/" component={Header} />
      <section className="section">
        <Switch>
          <Route path="/" exact component={Homepage} />
          <Route path="/:locale" exact component={Homepage} />
          <Route
            path="/:locale/docs/:slug*"
            render={props => <Document {...props} {...appProps} />}
          />
          <Route path="/search" component={Search} />
          <Route component={NoMatch} />
        </Switch>
      </section>
    </div>
  );
}

export default App;

function Header(props) {
  return (
    <header>
      <h1>
        <Link to="/">MDN Web Docs</Link>
      </h1>
      <p>Breadcrumbs here...</p>
    </header>
  );
}

class Homepage extends React.Component {
  render() {
    const { location, match } = this.props;
    const { locale } = match.params;
    if (!locale) {
      return <Redirect to={LOCALES[0]} />;
    } else if (!LOCALES.includes(locale)) {
      const found = LOCALES.find(
        each => each.toLowerCase() === locale.toLowerCase()
      );
      if (found) {
        return <Redirect to={found} />;
      } else {
        return <NoMatch location={location} message="Locale not found" />;
      }
    }
    return (
      <div>
        <h2>Welcome to MDN</h2>
        <ul>
          <li>
            <Link to="/en-US/docs/Web/HTML/Element/audio">HTML/audio</Link>
          </li>
          <li>
            <Link to="/en-US/docs/Web/HTML/Element/video">HTML/video</Link>
          </li>
          <li>
            <Link to="/en-US/docs/Web/HTML/Element/canvas">HTML/canvas</Link>
          </li>
        </ul>
      </div>
    );
  }
}

class Document extends React.Component {
  state = {
    document: this.props.document || null,
    loading: false,
    notFound: false,
    loadingError: null
  };

  componentDidMount() {
    const { match } = this.props;
    const { locale, slug } = match.params;
    if (!this.state.document) {
      this.fetchDocument(locale, slug);
    }
  }

  componentDidUpdate(prevProps) {
    const { match } = this.props;
    const prevMatch = prevProps.match;
    if (
      prevMatch.params.locale !== match.params.locale ||
      prevMatch.params.slug !== match.params.slug
    ) {
      console.log("New locale+slug:", [match.params.locale, match.params.slug]);
      this.fetchDocument(match.params.locale, match.params.slug);
    }
  }

  fetchDocument = (locale, slug) => {
    this.setState({ loading: true }, async () => {
      let url = document.location.pathname;
      if (!url.endsWith("/")) url += "/";
      url += "index.json";
      console.log("OPENING", url);
      let response;
      try {
        // response = await fetch(`/api/v0/documents/${locale}/${slug}`);
        // response = await fetch(`index.json`);
        response = await fetch(url);
      } catch (ex) {
        return this.setState({ loading: false, loadingError: ex });
      }
      if (!response.ok) {
        console.log(response);
        return this.setState({ loading: false, loadingError: response });
      } else {
        const data = await response.json();
        document.title = data.document.title;
        this.setState({ document: data.document, loading: false });
      }
    });
  };

  render() {
    const { document, loadingError, loading, notFound } = this.state;
    // console.log("RENDERING DOCUMENT:", document);
    const { location } = this.props;
    if (notFound) {
      return <NoMatch location={location} message="Document not found" />;
    }
    if (loading) {
      return <p>Loading...</p>;
    }
    if (loadingError) {
      return <LoadingError error={loadingError} />;
    }
    if (!document) {
      return null;
    }
    return (
      <div>
        <div>
          <h2>{document.title}</h2>
        </div>
        <div className="main">
          <div className="sidebar">SIDE BAR</div>
          <div className="content">
            <div dangerouslySetInnerHTML={{ __html: document.body_html }} />
          </div>
        </div>
      </div>
    );
  }
}

// function Document({ document }) {
//   return (
//     <div>
//       <div>
//         <h2>{document.title}</h2>
//       </div>
//       <div className="main">
//         <div className="sidebar">SIDE BAR</div>
//         <div className="content">
//           <div dangerouslySetInnerHTML={{ __html: document.body_html }} />
//         </div>
//       </div>
//     </div>
//   );
// }

function LoadingError({ error }) {
  return (
    <div className="loading-error">
      <h3>Loading Error</h3>
      {error instanceof window.Response ? (
        <p>
          <b>{error.status}</b> on <b>{error.url}</b>
          <br />
          <small>{error.statusText}</small>
        </p>
      ) : (
        <p>
          <code>{error.toString()}</code>
        </p>
      )}
    </div>
  );
}

function NoMatch({ location, message = null }) {
  return (
    <div>
      <h3>Page Not Found</h3>
      <p>
        {message ? message : `Sorry, no document for ${location.pathname}.`}
      </p>
    </div>
  );
}

function Search(props) {
  const [search, setSearch] = React.useState("");
  return (
    <form
      onSubmit={event => {
        event.preventDefault();
        console.log(`SEARCH FOR ${search}`);
      }}
    >
      <input
        type="search"
        value={search}
        onChange={event => {
          setSearch(event.target.value);
        }}
        placeholder="Search..."
      />
      <button type="submit">Search</button>
    </form>
  );
}
