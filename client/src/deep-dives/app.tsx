import Hero from "../ui/organisms/hero";

import "./index.scss";

export default function App() {
  return (
    <>
      <Hero />

      <div className="simple-content-container">
        <h3>What is MDN?</h3>
        <p>
          MDN’s mission is simple: provide developers with the information they
          need to easily build projects on the open Web. If it’s an open
          technology exposed to the Web, we want to document it.
        </p>

        <h3>Where does your content come from?</h3>
        <p>
          We are an open community of developers building resources for a better
          Web, regardless of brand, browser, or platform. Anyone can contribute
          and each person who does makes us stronger. We also receive
          significant content contributions from our partners including
          Microsoft, Google, Samsung, Igalia, W3C and others. Together we can
          continue to drive innovation on the Web to serve the greater good.
        </p>
      </div>

      <div className="mdn-history">
        <dl>
          <dt className="gradient-clip-text">2005</dt>
          <dd>MDN launched</dd>
          <dt className="gradient-clip-text">XXX</dt>
          <dd>xxx</dd>
          <dt className="gradient-clip-text">2017</dt>
          <dd>Google, Microsoft, and Samsung move documentation to MDN</dd>
          <dt className="gradient-clip-text">20xx</dt>
          <dd>over XX,000 edits by over XX,000 contributors</dd>
          <dt className="gradient-clip-text">2020</dt>
          <dd>
            Open Web Docs(OWD) created to crowdsource funding of web
            documentation on MDN
          </dd>
          <dt className="gradient-clip-text">2021</dt>
          <dd>MDN Plus</dd>
        </dl>
      </div>

      <div className="simple-content-container">
        <h3>What is MDN?</h3>
        <p>
          MDN’s mission is simple: provide developers with the information they
          need to easily build projects on the open Web. If it’s an open
          technology exposed to the Web, we want to document it.
        </p>

        <h3>We want your feedback</h3>
        <p>This in the intro to the expriment</p>
        <ul>
          <li>
            <a href="/plus/deep-dives/planning-for-browser-support">
              Planning for browser support
            </a>
          </li>
          <li>
            <a href="/plus/deep-dives/your-browser-support-toolkit">
              Your browser support toolkit
            </a>
          </li>
        </ul>
      </div>
    </>
  );
}
