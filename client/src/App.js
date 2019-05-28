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
          <Route
            path="/docs/:slug*"
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
            <Link to="/docs/Web/HTML/Element/audio">HTML/audio</Link>
          </li>
          <li>
            <Link to="/docs/Web/HTML/Element/video">HTML/video</Link>
          </li>
          <li>
            <Link to="/docs/Web/HTML/Element/canvas">HTML/canvas</Link>
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
            {/* <div dangerouslySetInnerHTML={{ __html: document.body_html }} /> */}
            <DocumentFromRecipe document={document} />
          </div>
        </div>
      </div>
    );
  }
}

function DocumentFromRecipe({ document }) {
  const sections = [];
  // console.log(document);

  // Sanity check
  if (!document.prose) {
    throw new Error("Document does not have a .prose");
  }

  const recipe = document.__recipe__;
  // console.log("RECIPE:", recipe);
  const explicitProse = Object.values(recipe.body)
    .filter(value => {
      return (
        typeof value === "string" &&
        value.startsWith("prose.") &&
        value !== "prose.*"
      );
    })
    .map(value => value.replace(/\?$/, "").replace(/^prose\./, ""));

  // console.log({ explicitProse });
  Object.values(recipe.body).forEach(value => {
    if (typeof value === "string" && value.startsWith("prose.")) {
      if (value === "prose.*") {
        // Gather all that are not mentioned in explicitProse
        Object.entries(document.prose)
          .filter(([key, value]) => {
            // XXX sets?
            return !explicitProse.includes(key);
          })
          .forEach(([key, values]) => {
            if (key in document.prose) {
              if (!Array.isArray(values)) {
                values = [values];
              }
              values.forEach((value, i) => {
                sections.push(
                  <Prose key={value + i} name={key} content={value} />
                );
              });
            }
          });
      } else {
        const optional = value.endsWith("?");
        const name = value.replace(/\?$/, "").replace(/^prose\./, "");
        if (name in document.prose) {
          // Great! Insert it now.
          sections.push(
            <Prose key={value} name={name} content={document.prose[name]} />
          );
        } else if (!optional) {
          throw new Error(
            `prose section '${name}' is not optional and not present in document.prose`
          );
        }
        // sections.push(<Prose key={value}, )
      }
    } else if (value === "meta.browser-compatibility") {
      if (!document.browser_compatibility) {
        throw new Error("Expecting document to have 'browser_compatibility'");
      }
      sections.push(
        <BrowserCompatibility
          key={value}
          content={document.browser_compatibility}
        />
      );
    } else {
      console.warn(`Not sure what to do with ${JSON.stringify(value)}`);
    }
  });
  return sections;
}

function Prose({ content }) {
  return <div dangerouslySetInnerHTML={{ __html: content }} />;
}

function BrowserCompatibility({ content }) {
  return (
    <table>
      <thead>
        <tr>
          <th rowSpan={2} />
          <th colSpan={2}>Desktop</th>
          <th colSpan={2}>Mobile</th>
        </tr>
        <tr>
          <th>Chrome</th>
          <th>Edge</th>
          <th>Chrome</th>
          <th>Edge</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <code>video</code>
          </td>
          <td style={{ backgroundColor: "#e4f8e1" }}>3</td>
          <td style={{ backgroundColor: "#e4f8e1" }}>Yes</td>
          <td>?</td>
          <td style={{ backgroundColor: "#f8e1e1" }}>No</td>
        </tr>
      </tbody>
    </table>
  );
}

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
