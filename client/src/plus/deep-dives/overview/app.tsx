import { useParams } from "react-router-dom";

import "./index.scss";

export default function App() {
  const { locale } = useParams();

  return (
    <div className="deep-dives-overview">
      <header className="overview-hero">
        <div className="header-wrapper">
          <div className="header-content">
            <div className="heading-group">
              <h1>Modern CSS in the Real World</h1>
              <h2>Featured Deep Dive</h2>
            </div>
            <p className="author">Rachel Andrew, CSS WG Invited Expert</p>
            <ul className="author-links">
              <li>
                <a href="https://twitter.com/rachelandrew" rel="external">
                  @rachelandrew
                </a>
                ,
              </li>
              <li>
                <a href="https://rachelandrew.co.uk" rel="external">
                  rachelandrew.co.uk
                </a>
              </li>
            </ul>
          </div>
        </div>
      </header>
      <div className="overview-content-container">
        <h3>About</h3>
        <p>
          One thing is clear about the web - the technology moves fast. There
          are new features and tools coming out all the time, and a pressure to
          try to keep up with the latest and greatest. This is often juxtaposed
          with the frustration of wanting to use those new features but finding
          it hard to do so while still supporting the browser set that your user
          base still uses.
        </p>
        <p>
          This is where our "Practical web compatibility" series comes in
          &mdash; expert knowledge distilled into easy-to-follow articles that
          provide practical solutions for using modern tech while not leaving
          older browsers behind.
        </p>
        <p>
          "Modern CSS in the Real World" begins by applying this formula to CSS.
          We will be covering the tools at your disposal to cope with browser
          compatibility, from those which help you identify bugs and find out
          what is supported where, to those which help create fallbacks, or
          polyfill support. We’ll be working through example patterns to see how
          we can create a good experience, despite different browser
          capabilities.
        </p>
        <p>
          This first article will provide you with a high-level summary of the
          types of CSS issues you’ll be facing, and a good framework for
          deciding on a support strategy, and communicating it with your team.
        </p>
        <p>
          Subsequent articles will look in-depth at the tools and techniques
          you’ll be using to solve such issues, and present reusable patterns
          that demonstrate those tools and techniques in practice.
        </p>

        <h3>In this series</h3>
        <ul className="overview-series-list">
          <li>
            <a
              href={`/${locale}/plus/deep-dives/planning-for-browser-support`}
              className="overview-series-list-item planning-for-browser-support"
            >
              <div className="item-content">
                <h4>Planning for browser support</h4>
                <p>
                  Learn about the types of CSS issues you'll be facing when
                  working with your team in a web-based environment and tips for
                  developing a future-proof support strategy
                </p>
              </div>
            </a>
          </li>
          <li>
            <a
              href={`/${locale}/plus/deep-dives/your-browser-support-toolkit`}
              className="overview-series-list-item your-browser-support-toolkit"
            >
              <div className="item-content">
                <h4>Your browser support toolkit</h4>
                <p>
                  In this article discover the resources available, to help you
                  develop a site that will perform well across browsers and
                  devices
                </p>
              </div>
            </a>
          </li>
          <li className="unavailable">
            <div className="item-content">
              <h4>Practical browser support &mdash; Coming soon</h4>
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
