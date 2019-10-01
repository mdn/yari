import React from "react";
import { Link } from "@reach/router";

import { NoMatch } from "./routing";
import { InteractiveExample } from "./ingredients/interactive-example";
import { Attributes } from "./ingredients/attributes";
import { Example, Examples } from "./ingredients/examples";
import { LinkList } from "./ingredients/link-list";
import { BrowserCompatibilityTable } from "./ingredients/browser-compatibility-table";

export class Document extends React.Component {
  state = {
    doc: this.props.doc || null,
    loading: false,
    notFound: false,
    loadingError: null
  };

  componentDidMount() {
    if (!this.state.doc) {
      this.fetchDocument();
    }
  }

  componentDidUpdate(prevProps) {
    const currentSlug = this.props["*"];
    const prevSlug = prevProps["*"];
    if (currentSlug !== prevSlug) {
      this.fetchDocument();
    }
  }

  fetchDocument = () => {
    this.setState({ loading: true }, async () => {
      let url = document.location.pathname;
      if (!url.endsWith("/")) url += "/";
      url += "index.json";
      console.log("OPENING", url);
      let response;
      try {
        response = await fetch(url);
      } catch (ex) {
        return this.setState({ loading: false, loadingError: ex });
      }
      if (!response.ok) {
        console.warn(response);
        return this.setState({ loading: false, loadingError: response });
      } else {
        const data = await response.json();
        document.title = data.doc.title;
        this.setState({ doc: data.doc, loading: false });
      }
    });
  };

  render() {
    const { doc, loadingError, loading, notFound } = this.state;
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
    if (!doc) {
      return null;
    }
    return (
      <div>
        <h1 className="page-title">{doc.title}</h1>
        <div className="main">
          <div className="sidebar">
            <RenderSideBar doc={doc} />
          </div>
          <div className="content">
            <RenderDocumentBody doc={doc} />
            <hr />
            {doc.contributors && (
              <Contributors contributors={doc.contributors} />
            )}
          </div>
        </div>
      </div>
    );
  }
}

function RenderSideBar({ doc }) {
  return doc.related_content.map(node => (
    <SidebarLeaf
      key={node.title}
      depth={0}
      title={node.title}
      content={node.content || []}
    />
  ));
}

function SidebarLeaf({ title, content }) {
  const titleNode = <h3>{title}</h3>;
  return (
    <div>
      {titleNode}
      <ul>
        {content.map(node => {
          if (node.content) {
            return (
              <li key={node.title}>
                <SidebarLeaflets node={node} />
              </li>
            );
          } else {
            return (
              <li key={node.uri}>
                <Link to={node.uri}>{node.title}</Link>
              </li>
            );
          }
        })}
      </ul>
    </div>
  );
}

function SidebarLeaflets({ node }) {
  return (
    <details>
      <summary>{node.title}</summary>
      <ol>
        {node.content.map(childNode => {
          return (
            <li key={childNode.uri}>
              <Link to={childNode.uri}>{childNode.title}</Link>
            </li>
          );
        })}
      </ol>
    </details>
  );
}

/** These prose sections should be rendered WITHOUT a heading. */
const PROSE_NO_HEADING = ["short_description", "overview"];

function RenderDocumentBody({ doc }) {
  return doc.body.map((section, i) => {
    if (section.type === "prose") {
      // Only exceptional few should use the <Prose/> component,
      // as opposed to <ProseWithHeading/>.
      if (!section.value.id || PROSE_NO_HEADING.includes(section.value.id)) {
        return <Prose key={section.value.id} section={section.value} />;
      } else {
        return (
          <ProseWithHeading
            key={section.value.id}
            id={section.value.id}
            section={section.value}
          />
        );
      }
    } else if (section.type === "interactive_example") {
      return (
        <InteractiveExample
          key={section.value.url}
          url={section.value.url}
          height={section.value.height}
          title={doc.title}
        />
      );
    } else if (section.type === "attributes") {
      return <Attributes key={`attributes${i}`} attributes={section.value} />;
    } else if (section.type === "browser_compatibility") {
      return (
        <BrowserCompatibilityTable
          key="browser_compatibility"
          data={section.value}
        />
      );
    } else if (section.type === "examples") {
      return <Examples key={`examples${i}`} examples={section.value} />;
    } else if (section.type === "example") {
      return <Example key={`example${i}`} example={section.value} />;
    } else if (section.type === "info_box") {
      // XXX Unfinished!
      // https://github.com/mdn/stumptown-content/issues/106
      // console.warn("Don't know how to deal with info_box!");
      // console.log(section);
      return null;
    } else if (section.type === "link_list") {
      return (
        <LinkList title={section.value.title} links={section.value.content} />
      );
    } else {
      // console.warn(section);
      throw new Error(`No idea how to handle a '${section.type}' section`);
    }
  });
}

function Prose({ section }) {
  return <div dangerouslySetInnerHTML={{ __html: section.content }} />;
}

function ProseWithHeading({ id, section }) {
  if (!id) {
    id = section.title.replace(/\s+/g, "_").trim();
  }
  return (
    <>
      <h2 id={id}>{section.title}</h2>
      <div dangerouslySetInnerHTML={{ __html: section.content }} />
    </>
  );
}

function Contributors({ contributors }) {
  return (
    <div>
      <b>Contributors to this page:</b>
      <span dangerouslySetInnerHTML={{ __html: contributors }} />
    </div>
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
