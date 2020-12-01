import * as React from "react";

import "../../document/index.scss";

const defaults = {
  title: "Atoms/Links",
};

export default defaults;

export const simpleLink = () => (
  <article className="article">
    <a href="https://developer.mozilla.org/">MDN</a>
  </article>
);

export const paragraphWithCodeElementLinks = () => (
  <article className="article">
    <p>
      A{" "}
      <a href="#temp">
        <code>Promise</code>
      </a>{" "}
      that resolves to a{" "}
      <a href="#temp">
        <code>DOMString</code>
      </a>{" "}
      with the permission picked by the user. Possible values for this string
      are:
    </p>
  </article>
);

export const level2HeadingLinkWithCodeElement = () => (
  <article className="article">
    <h2>
      <a href="https://developer.mozilla.org/">
        The <code>PushEvent</code>
      </a>
    </h2>
  </article>
);

export const level3HeadingLinkWithCodeElement = () => (
  <article className="article">
    <h3>
      <a href="https://developer.mozilla.org/">
        The <code>PushEvent</code>
      </a>
    </h3>
  </article>
);

export const externalLink = () => (
  <article className="article">
    <a
      className="bc-github-link external external-icon"
      href="#temp"
      target="_blank"
      rel="noopener noreferrer"
      title="Report an issue with this compatibility data"
    >
      Report problems with this data on GitHub
    </a>
  </article>
);

export const paragraphWithVariousLinkTypes = () => (
  <article className="article">
    <p className="summary">
      <span className="seoSummary">
        <strong>JavaScript</strong> (<strong>JS</strong>) is a lightweight,
        interpreted, or{" "}
        <a href="https://en.wikipedia.org/wiki/Just-in-time_compilation">
          just-in-time
        </a>{" "}
        compiled programming language with{" "}
        <a href="#temp">first-class functions</a>. While it is most well-known
        as the scripting language for Web pages,{" "}
        <a
          class="external"
          href="https://en.wikipedia.org/wiki/JavaScript#Uses_outside_Web_pages"
        >
          many non-browser environments
        </a>{" "}
        also use it, such as <a href="#temp">Node.js</a>,{" "}
        <a class="external" href="https://couchdb.apache.org/">
          Apache CouchDB
        </a>{" "}
        and{" "}
        <a
          class="external"
          href="http://www.adobe.com/devnet/acrobat/javascript.html"
        >
          Adobe Acrobat
        </a>
        .
      </span>{" "}
      JavaScript is a <a href="#temp">prototype-based</a>, multi-paradigm,
      single-threaded, dynamic language, supporting object-oriented, imperative,
      and declarative (e.g. functional programming) styles. Read more{" "}
      <a href="#temp">about JavaScript</a>.
    </p>
  </article>
);
