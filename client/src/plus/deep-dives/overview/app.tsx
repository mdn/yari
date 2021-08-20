import React from "react";
import { useParams, useSearchParams } from "react-router-dom";

import "./index.scss";

export default function App() {
  const { locale } = useParams();
  const [searchParams] = useSearchParams();
  const [showPFBSContents, setShowPFBSContents] = React.useState(false);
  const [showYBSTContents, setShowYBSTContents] = React.useState(false);
  const [showFullArticle, setShowFullArticle] = React.useState(false);

  return (
    <div className="deep-dives-overview">
      <header className="overview-hero">
        <div className="header-content">
          <h1>Modern CSS in the Real World</h1>
          <p className="author">
            <a href="https://twitter.com/rachelandrew" rel="external">
              @rachelandrew
            </a>
          </p>
        </div>
      </header>
      <div className="overview-content-container">
        <p>
          One thing is clear about the web - the technology moves fast. There
          are new features and tools coming out all the time, and a pressure to
          try to keep up with the latest and greatest
          <button
            type="button"
            className={`ghost ${showFullArticle ? "hidden" : undefined}`}
            onClick={() => {
              setShowFullArticle(true);
            }}
          >
            <span>&hellip;</span> Read more
          </button>
        </p>
        {showFullArticle && (
          <>
            <p>
              This is often juxtaposed with the frustration of wanting to use
              those new features but finding it hard to do so while still
              supporting the browser set that your user base still uses.
            </p>
            <p>
              This is where our "Practical web compatibility" series comes in
              &mdash; expert knowledge distilled into easy-to-follow articles
              that provide practical solutions for using modern tech while not
              leaving older browsers behind.
            </p>
            <p>
              "Modern CSS in the Real World" begins by applying this formula to
              CSS. We will be covering the tools at your disposal to cope with
              browser compatibility, from those which help you identify bugs and
              find out what is supported where, to those which help create
              fallbacks, or polyfill support. We’ll be working through example
              patterns to see how we can create a good experience, despite
              different browser capabilities.
            </p>
            <p>
              This first article will provide you with a high-level summary of
              the types of CSS issues you’ll be facing, and a good framework for
              deciding on a support strategy, and communicating it with your
              team.
            </p>
            <p>
              Subsequent articles will look in-depth at the tools and techniques
              you’ll be using to solve such issues, and present reusable
              patterns that demonstrate those tools and techniques in practice.
            </p>
          </>
        )}

        <h2>In this series</h2>
        <ul className="overview-series-list">
          <li className="series-item planning-for-browser-support">
            <div className="series-item-content">
              <h3>
                <a
                  href={`/${locale}/plus/deep-dives/planning-for-browser-support${
                    searchParams.toString() ? `?${searchParams.toString()}` : ""
                  }`}
                  className="overview-series-list-item"
                >
                  1. Planning for browser support
                </a>
              </h3>
              <p>
                Learn about the types of CSS issues you'll be facing when
                working with your team in a web-based environment and tips for
                developing a future-proof support strategy
              </p>
              {!showPFBSContents && (
                <button
                  type="button"
                  className="ghost show-contents-button"
                  onClick={() => {
                    setShowPFBSContents(true);
                  }}
                >
                  See contents
                </button>
              )}
            </div>
          </li>
          {showPFBSContents && (
            <li className="deep-dive-toc">
              <h4>
                <a
                  href={`deep-dives/planning-for-browser-support${
                    searchParams.toString() ? `?${searchParams.toString()}` : ""
                  }#types-of-compatibility-problems`}
                >
                  Types of compatibility problems
                </a>
              </h4>
              <ul>
                <li>
                  <a
                    href={`deep-dives/planning-for-browser-support${
                      searchParams.toString()
                        ? `?${searchParams.toString()}`
                        : ""
                    }#browsers-that-are-locked-in-the-past`}
                  >
                    Browsers that are locked in the past
                  </a>
                </li>
                <li>
                  <a
                    href={`deep-dives/planning-for-browser-support${
                      searchParams.toString()
                        ? `?${searchParams.toString()}`
                        : ""
                    }#browsers-that-support-a-feature-but-have-bugs`}
                  >
                    Browsers that support a feature but have bugs
                  </a>
                </li>
                <li>
                  <a
                    href={`deep-dives/planning-for-browser-support${
                      searchParams.toString()
                        ? `?${searchParams.toString()}`
                        : ""
                    }#browsers-which-dont-support-a-feature-yet`}
                  >
                    Browsers which don’t support a feature yet
                  </a>
                </li>
              </ul>
              <h4>
                <a
                  href={`deep-dives/planning-for-browser-support${
                    searchParams.toString() ? `?${searchParams.toString()}` : ""
                  }#what-does-supporting-a-browser-mean`}
                >
                  What does “supporting a browser” mean to you?
                </a>
              </h4>
              <h4>
                <a
                  href={`deep-dives/planning-for-browser-support${
                    searchParams.toString() ? `?${searchParams.toString()}` : ""
                  }#creating-a-browser-support-strategy`}
                >
                  Creating a browser support strategy for your project
                </a>
              </h4>
              <ul>
                <li>
                  <a
                    href={`deep-dives/planning-for-browser-support${
                      searchParams.toString()
                        ? `?${searchParams.toString()}`
                        : ""
                    }#what-do-you-know-about-your-users`}
                  >
                    What do you know about your users?
                  </a>
                </li>
                <li>
                  <a
                    href={`deep-dives/planning-for-browser-support${
                      searchParams.toString()
                        ? `?${searchParams.toString()}`
                        : ""
                    }#where-is-it-best-to-spend-time-and-money`}
                  >
                    Where is it best to spend your time and money?
                  </a>
                </li>
                <li>
                  <a
                    href={`deep-dives/planning-for-browser-support${
                      searchParams.toString()
                        ? `?${searchParams.toString()}`
                        : ""
                    }#core-design-elements-vs-enhancements`}
                  >
                    Core design elements vs. enhancements
                  </a>
                </li>
                <li>
                  <a
                    href={`deep-dives/planning-for-browser-support${
                      searchParams.toString()
                        ? `?${searchParams.toString()}`
                        : ""
                    }#show-dont-tell`}
                  >
                    Show, don’t tell
                  </a>
                </li>
              </ul>
              <h4>
                <a
                  href={`deep-dives/planning-for-browser-support${
                    searchParams.toString() ? `?${searchParams.toString()}` : ""
                  }#keep-your-strategy-up-to-date`}
                >
                  Keep your strategy up-to-date
                </a>
              </h4>
            </li>
          )}
          <li className="series-item your-browser-support-toolkit">
            <div className="series-item-content">
              <h3>
                <a
                  href={`/${locale}/plus/deep-dives/your-browser-support-toolkit${
                    searchParams.toString() ? `?${searchParams.toString()}` : ""
                  }`}
                  className="overview-series-list-item"
                >
                  2. Your browser support toolkit
                </a>
              </h3>
              <p>
                In this article discover the resources available, to help you
                develop a site that will perform well across browsers and
                devices
              </p>
              {!showYBSTContents && (
                <button
                  type="button"
                  className="ghost show-contents-button"
                  onClick={() => {
                    setShowYBSTContents(true);
                  }}
                >
                  See contents
                </button>
              )}
            </div>
          </li>
          {showYBSTContents && (
            <li className="deep-dive-toc">
              <h4>
                <a
                  href={`deep-dives/your-browser-support-toolkit${
                    searchParams.toString() ? `?${searchParams.toString()}` : ""
                  }#resources-for-browser-support-information`}
                >
                  Resources for browser support information
                </a>
              </h4>
              <ul>
                <li>
                  <a
                    href={`deep-dives/your-browser-support-toolkit${
                      searchParams.toString()
                        ? `?${searchParams.toString()}`
                        : ""
                    }#looking-up-browser-bugs`}
                  >
                    Looking up browser bugs
                  </a>
                </li>
                <li>
                  <a
                    href={`deep-dives/your-browser-support-toolkit${
                      searchParams.toString()
                        ? `?${searchParams.toString()}`
                        : ""
                    }#learning-about-features-that-are-coming-soon`}
                  >
                    Learning about features that are coming soon
                  </a>
                </li>
              </ul>
              <h4>
                <a
                  href={`deep-dives/your-browser-support-toolkit${
                    searchParams.toString() ? `?${searchParams.toString()}` : ""
                  }#web-platform-features-and-fallbacks`}
                >
                  Web platform features and fallbacks
                </a>
              </h4>
              <ul>
                <li>
                  <a
                    href={`deep-dives/your-browser-support-toolkit${
                      searchParams.toString()
                        ? `?${searchParams.toString()}`
                        : ""
                    }#using-the-cascade`}
                  >
                    Using the cascade
                  </a>
                </li>
                <li>
                  <a
                    href={`deep-dives/your-browser-support-toolkit${
                      searchParams.toString()
                        ? `?${searchParams.toString()}`
                        : ""
                    }#feature-queries`}
                  >
                    Feature queries
                  </a>
                </li>
                <li>
                  <a
                    href={`deep-dives/your-browser-support-toolkit${
                      searchParams.toString()
                        ? `?${searchParams.toString()}`
                        : ""
                    }#vendor-prefixes`}
                  >
                    Vendor prefixes
                  </a>
                </li>
              </ul>
              <h4>
                <a
                  href={`deep-dives/your-browser-support-toolkit${
                    searchParams.toString() ? `?${searchParams.toString()}` : ""
                  }#third-party-tools`}
                >
                  Third party tools
                </a>
              </h4>
              <ul>
                <li>
                  <a
                    href={`deep-dives/your-browser-support-toolkit${
                      searchParams.toString()
                        ? `?${searchParams.toString()}`
                        : ""
                    }#postcss`}
                  >
                    PostCSS
                  </a>
                </li>
                <li>
                  <a
                    href={`deep-dives/your-browser-support-toolkit${
                      searchParams.toString()
                        ? `?${searchParams.toString()}`
                        : ""
                    }#polyfills`}
                  >
                    Polyfills
                  </a>
                </li>
              </ul>
              <h4>
                <a
                  href={`deep-dives/your-browser-support-toolkit${
                    searchParams.toString() ? `?${searchParams.toString()}` : ""
                  }#testing`}
                >
                  Testing
                </a>
              </h4>
            </li>
          )}
          <li className="series-item unavailable">
            <div className="series-item-content">
              <h3>3. Practical browser support &mdash; Coming soon</h3>
              <p>
                Tips for dealing with very old browsers, in particular IE11, an
                explanation of how to diagnose bugs, and a walkthrough of
                progressively enhancing a component using modern techniques.
              </p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}
