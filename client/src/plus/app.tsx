import React from "react";

import { Card } from "../ui/molecules/card";
import { Hero } from "../ui/organisms/hero";
import { ProductFeatures } from "../ui/organisms/product-features";
import { Feature } from "./deep-dives/feature";

import "./index.scss";

export default function App() {
  const [showDeepDive, setShowDeepDive] = React.useState(false);

  return (
    <div className="plus">
      <Hero />

      <div className="overview-wrapper">
        <div className="overview-content-wrapper">
          <div className="overview-mdn-plus">
            <h2>What is MDN Plus</h2>
            <p>
              MDN Plus builds on top of your much-loved core content, providing
              constantly-updated guides to highly-requested topics, helping you
              keep your knowledge fresh and your skills sharp. In addition, MDN
              Plus includes tools to make MDN more powerful for you, creating a
              more personalized experience.
            </p>
          </div>

          <div className="overview-mdn-web-docs">
            <h2>What does this mean for MDN Web Docs</h2>
            <p>
              <b>Nothing</b> is changing with the existing MDN Web Docs content
              — this content will continue to be free and available to everyone.
              We want to provide extra value through premium content and
              features to help make MDN self-sustaining, on a completely opt-in
              basis. Again,
              <b> nothing is changing </b> with the existing MDN Web Docs!
            </p>
          </div>
        </div>
      </div>

      <Feature />

      <div className="sample-deep-dive">
        <div className="girdle">
          <p className="deep-dive-lead">
            Read an excerpt from{" "}
            <span className="pink-highlighter">
              "Your browser support toolkit",
            </span>{" "}
            the second article from the forthcoming deep dive{" "}
            <i>Modern CSS in the Real World</i> by Rachel Andrew.
          </p>

          <div className="main-article-content-container">
            <div className="sample-deep-dive-sidebar">
              <Card featured={true}>
                <p className="card-type-heading">Featured Deep Dive</p>
                <h2 id="card-title">
                  Modern CSS in the Real World: Your browser support toolkit
                </h2>
                <p className="author">By Rachel Andrew</p>

                <h3>This three part series includes:</h3>
                <ul>
                  <li>Planning for browser support</li>
                  <li>
                    <span className="pink-highlighter">
                      Your browser support toolkit
                    </span>
                  </li>
                  <li>Practical browser support</li>
                </ul>
              </Card>
            </div>

            <article className="sample-deep-dive-article">
              <div className={showDeepDive ? "" : "fade"}>
                <h4>Web platform features and fallbacks</h4>
                <p>
                  If you have discovered that a feature isn’t supported in a
                  browser, but still intend to use it, you might need to create
                  a fallback for browsers that don't support it. In addition, if
                  you are allowing browsers without support to fall back to a
                  basic layout, you need to make sure that the code aimed at
                  modern browsers doesn’t leak through to older browsers and
                  make a mess.
                </p>
                <p>
                  In recent years creating CSS fallbacks has become much easier
                  and CSS has native features that can help you. Two of the most
                  powerful are the cascade and feature queries, and we'll
                  explore these now. Later on we'll also look at how vendor
                  prefixes can be a useful tool as long as they are used
                  carefully.
                </p>
                <h4>Using the cascade </h4>
                <p>
                  The first thing to look at is how the cascade works with
                  properties and values that are not understood by a browser. We
                  can create simple fallbacks by writing CSS for old browsers,
                  then following it with CSS aimed at newer browsers. For
                  example, you might want to provide a simple solid background
                  color for really old browsers, and a semi-transparent color
                  for newer browsers:
                </p>
                <div className="code-snippet">
                  <code>
                    <span className="code-c">background-color</span>: red;
                    <br />
                    <span className="code-c">background-color</span>: rgba(
                    <span className="code-m">255</span>,
                    <span className="code-m">0</span>,
                    <span className="code-m">0</span>,
                    <span className="code-m">0.6</span>);
                  </code>
                </div>
              </div>
              {showDeepDive && (
                <div aria-expanded={showDeepDive}>
                  <p>
                    The idea is that older browsers support the first
                    declaration and so will apply it to the page, then treat the
                    second one as invalid because they don't support it — this
                    means they completely ignore it. Newer browsers will support
                    both declarations, however the rules of the cascade mean
                    that the declaration that comes later in the stylesheet will
                    override the earlier one, and be used by the browser.
                  </p>

                  <p>
                    CSS also has rules defining what happens when there are two
                    potentially conflicting things being applied to an element.
                    For example, if you have a floated item and its parent
                    becomes a grid container, the floated item stops behaving
                    like a floated item and becomes a grid item. We can see how
                    this works in the following demo.
                  </p>
                  <p>
                    In this example, the component has a simple, floated layout.
                    This is the layout that browsers without CSS Grid support
                    will use. For newer browsers the container has been turned
                    into a grid container, which means that in a browser with
                    CSS grid support the float is not applied.
                  </p>
                  <div className="code-snippet">
                    <div className="codepen">
                      <iframe
                        id="cp_embed_MWJVaqm"
                        src="https://codepen.io/rachelandrew/embed/qBrZVVm?height=450&amp;theme-id=1&amp;slug-hash=qBrZVVm&amp;default-tab=css,result"
                        scrolling="no"
                        allowFullScreen={false}
                        title="Modern CSS 2:2"
                        className="codepen"
                        loading="lazy"
                        style={{
                          width: "100%",
                          overflow: "hidden",
                          height: "100%",
                        }}
                        frameBorder={0}
                      ></iframe>
                    </div>
                  </div>
                  <h4>Feature Queries</h4>
                  <p>
                    For very simple fallbacks, the overriding method shown
                    previously may work. It can however require that you order
                    the declarations and rules in your CSS carefully, making it
                    more brittle than you might like. You may also run into
                    problems when you want to use additional CSS to enhance the
                    layout in newer browsers, if that CSS is also understood by
                    older browsers.
                  </p>
                  <p>
                    In the next demo, I have given the left-hand column a
                    background color. I only want this to apply to the CSS Grid
                    layout, where I can ensure that the columns will be the same
                    height as each other. However, using the previous method the
                    background color is understood and therefore used by
                    browsers without CSS Grid support too. I have also added
                    widths to the floated elements. As a percentage width is
                    interpreted by the grid layout as a percentage of the column
                    track, this causes the columns to become narrower than the
                    track.
                  </p>
                  <div className="code-snippet">
                    <div className="codepen">
                      <iframe
                        id="cp_embed_MWJVaqm"
                        src="https://codepen.io/rachelandrew/embed/gOmrXqQ?height=450&amp;theme-id=1&amp;slug-hash=gOmrXqQ&amp;default-tab=css,result"
                        scrolling="no"
                        allowFullScreen={false}
                        title="Modern CSS 2.3 before"
                        className="codepen"
                        loading="lazy"
                        style={{
                          width: "100%",
                          overflow: "hidden",
                          height: "100%",
                        }}
                        frameBorder={0}
                      ></iframe>
                    </div>
                  </div>
                  <p>
                    In situations like this, CSS Feature Queries are useful. A
                    feature query is similar to a media query, however instead
                    of testing to see how large the viewport is, we are testing
                    to see if a browser has support for that feature.
                  </p>
                  <p>
                    Introducing a Feature Query into our demo means that we can
                    wrap up all of our grid code with a test to see if the
                    browser supports <code>display: grid</code>.
                  </p>
                  <div className="code-snippet">
                    <div className="codepen">
                      <iframe
                        id="cp_embed_MWJVaqm"
                        src="https://codepen.io/rachelandrew/embed/xxqVPjq?height=450&amp;theme-id=1&amp;slug-hash=MWJVaqm&amp;default-tab=css,result"
                        scrolling="no"
                        allowFullScreen={false}
                        title="Modern CSS 2.3 after"
                        className="codepen"
                        loading="lazy"
                        style={{
                          width: "100%",
                          overflow: "hidden",
                          height: "100%",
                        }}
                        frameBorder={0}
                      ></iframe>
                    </div>
                  </div>
                  <p>
                    Feature Queries are a simple test to see if the browser can
                    parse a given declaration. They can’t tell you if the
                    browser supports that feature without bugs, however with a
                    good knowledge of browser support they can be a great way to
                    safely add enhancements to a design. In the next article we
                    will look at some more realistic components and how to use
                    this method to build in progressively enhanced support.
                  </p>
                  <div className="deep-dive-sidebar">
                    <p>
                      You can also test for feature support using JavaScript,
                      using{" "}
                      <a href="(https://developer.mozilla.org/en-US/docs/Web/API/CSS/supports">
                        CSS.supports()
                      </a>
                      . As with Feature Queries in CSS, this function takes a
                      property and value as arguments. Therefore, to test for
                      CSS Grid layout support, you would use:
                    </p>
                    <div className="code-snippet">
                      <code>
                        <span className="code-c">let</span>{" "}
                        <span className="code-m">result</span> ={" "}
                        <span className="code-c">CSS</span>.
                        <span className="code-y">supports</span>(“display”,
                        “grid”);
                      </code>
                    </div>
                    <p>
                      The returned result is true or false, indicating if the
                      browser does or does not have support.
                    </p>
                  </div>
                </div>
              )}
              {!showDeepDive && (
                <button
                  className="button primary"
                  type="button"
                  onClick={() => {
                    setShowDeepDive(!showDeepDive);
                  }}
                >
                  Expand deep dive
                </button>
              )}
            </article>
          </div>
        </div>
      </div>

      <ProductFeatures withIntro={true} />

      <div className="product-cost">
        <div className="girdle">
          <h4>How much will it cost?</h4>
          <p>
            We’re asking for $5/month<sup>*</sup>. Your subscription includes
            full access to the premium content and features.
          </p>
          <p>
            <small>*Price is subject to change</small>
          </p>
        </div>
      </div>
    </div>
  );
}
