import React from "react";

const defaults = {
  title: "Atoms/Tables",
};

export default defaults;

export const standardTable = () => {
  return (
    <table className="standard-table">
      <thead>
        <tr>
          <th className="header" scope="col">
            Property/Element
          </th>
          <th className="header" scope="col">
            Description
          </th>
          <th className="header" scope="col">
            Example
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <code>input</code>
            <br />
            <span
              className="inlineIndicator readOnly readOnlyInline"
              title="This value may not be changed."
            >
              Read only{" "}
            </span>
          </td>
          <td>
            The original string against which the regular expression was
            matched.
          </td>
          <td>
            <code>"cdbBdbsbz"</code>
          </td>
        </tr>
        <tr>
          <td>
            <code>index</code>
            <br />
            <span
              className="inlineIndicator readOnly readOnlyInline"
              title="This value may not be changed."
            >
              Read only{" "}
            </span>
          </td>
          <td>The zero-based index of the match in the string.</td>
          <td>
            <code>1</code>
          </td>
        </tr>
      </tbody>
    </table>
  );
};

export const standardTableWithLinks = () => {
  return (
    <table class="standard-table">
      <thead>
        <tr>
          <th scope="col">Event Name</th>
          <th scope="col">Fired When</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <a href="/en-US/docs/Web/API/ScriptProcessorNode/audioprocess_event">
              <code>audioprocess</code>
            </a>
            <span
              title="This deprecated API should no longer be used, but will probably still work."
              className="icon-only-inline"
            >
              <i className="icon-thumbs-down-alt"></i>
            </span>
          </td>
          <td>
            The input buffer of a{" "}
            <a href="/en-US/docs/Web/API/ScriptProcessorNode">
              <code>ScriptProcessorNode</code>
            </a>
            is ready to be processed.
          </td>
        </tr>
        <tr>
          <td>
            <a href="/en-US/docs/Web/API/HTMLMediaElement/canplay_event">
              <code>canplay</code>
            </a>
          </td>
          <td>
            The browser can play the media, but estimates that not enough data
            has been loaded to play the media up to its end without having to
            stop for further buffering of content.
          </td>
        </tr>
        <tr>
          <td>
            <a href="/en-US/docs/Web/API/HTMLMediaElement/canplaythrough_event">
              <code>canplaythrough</code>
            </a>
          </td>
          <td>
            The browser estimates it can play the media up to its end without
            stopping for content buffering.
          </td>
        </tr>
      </tbody>
    </table>
  );
};

export const propertiesTable = () => {
  return (
    <table className="properties">
      <tbody>
        <tr>
          <th scope="row">
            <a
              href="/en-US/docs/Web/Guide/HTML/Content_categories"
              data-flaw="link5"
            >
              Content categories
            </a>
          </th>
          <td>
            <a
              href="/en-US/docs/Web/Guide/HTML/Content_categories#Flow_content"
              data-flaw="link6"
            >
              Flow content
            </a>
            , phrasing content, embedded content. If it has a{" "}
            <a href="/en-US/docs/Web/HTML/Element/video#attr-controls">
              <code>controls</code>
            </a>
            attribute: interactive content and palpable content.
          </td>
        </tr>
        <tr>
          <th scope="row">Permitted content</th>
          <td>
            <p>
              If the element has a{" "}
              <a href="/en-US/docs/Web/HTML/Element/video#attr-src">
                <code>src</code>
              </a>
              attribute: zero or more{" "}
              <a href="/en-US/docs/Web/HTML/Element/track">
                <code>&lt;track&gt;</code>
              </a>
              elements, followed by transparent content that contains no media
              elements–that is no{" "}
              <a href="/en-US/docs/Web/HTML/Element/audio">
                <code>&lt;audio&gt;</code>
              </a>
              or{" "}
              <a href="/en-US/docs/Web/HTML/Element/video">
                <code>&lt;video&gt;</code>
              </a>
            </p>

            <p>
              Else: zero or more{" "}
              <a href="/en-US/docs/Web/HTML/Element/source">
                <code>&lt;source&gt;</code>
              </a>
              elements, followed by zero or more{" "}
              <a href="/en-US/docs/Web/HTML/Element/track">
                <code>&lt;track&gt;</code>
              </a>
              elements, followed by transparent content that contains no media
              elements–that is no{" "}
              <a href="/en-US/docs/Web/HTML/Element/audio">
                <code>&lt;audio&gt;</code>
              </a>
              or{" "}
              <a href="/en-US/docs/Web/HTML/Element/video">
                <code>&lt;video&gt;</code>
              </a>
              .
            </p>
          </td>
        </tr>
        <tr>
          <th scope="row">Tag omission</th>
          <td>None, both the starting and ending tag are mandatory.</td>
        </tr>
      </tbody>
    </table>
  );
};
