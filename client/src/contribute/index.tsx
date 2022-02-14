import "./index.scss";

const STATS = [
  { number: "2005", legend: "year founded" },
  { number: "45k", legend: "total contributors" },
  { number: "200", legend: "commits per week" },
  { number: ">95M", legend: "page views per month" },
];

export function Contribute() {
  return (
    <main className="contribute">
      <div className="stats-container dark">
        <section className="stats-header">
          <h1>Community for a better Web</h1>
          <ul className="stats">
            {STATS.map((s) => (
              <li>
                <span className="number">{s.number}</span>
                <span className="legend">{s.legend}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <section>
        <p>
          The power of MDN lies in its vast, vital community of active users and
          contributors. Since the origins of MDN in 2005, approximately 60,000
          contributions have created the documentation repository we know and
          love, with over 45,000 documents and counting: An up-to-date,
          comprehensive and free resource with a wealth of documents both in
          English and{" "}
          <a href="/en-US/docs/MDN/Contribute/Localize">
            localized for different languages
          </a>
          . With over 200 commits per week, the culture of active contribution
          is going strong. And you can be a part of it.
        </p>
        <h2>Our partners</h2>
        <h3>The Product Advisory Board</h3>
        <p>
          MDN collaborates with partners from across the industry, including
          standards bodies, browser vendors, and other industry leaders. Since
          2017, these collaborators are formally represented through the{" "}
          <a href="/en-US/docs/MDN/MDN_Product_Advisory_Board">
            Product Advisory Board
          </a>{" "}
          (PAB). MDN is an influential resource and the PAB helps ensure that
          MDN’s influence puts the Web first, not any one vendor or
          organization, and respects the needs of web developers across the
          industry. Each quarter, the PAB meets to discuss problems, prioritize
          content creation, and make connections for future collaborations.
        </p>
        <blockquote className="pab">
          <div className="partner">
            <h4>
              &nbsp;Product&nbsp;
              <br />
              &nbsp;Advisory&nbsp;Board&nbsp;
            </h4>
          </div>
          <p>
            Our constant quest for innovation starts here, with you. Every part
            of MDN (docs, demos and the site itself) springs from our incredible
            open community of developers. Please join us!
          </p>
        </blockquote>
        <h3>Open Web Docs</h3>
        <p>
          <a
            href="https://openwebdocs.org/"
            target="_blank"
            rel="noreferrer noopener"
            className="external"
          >
            Open Web Docs
          </a>{" "}
          (OWD), an independent open source organization, is one of the most
          productive contributors to MDN Web Docs. OWD contributes as part of{" "}
          <a
            href="https://github.com/openwebdocs/project/blob/main/charter.md"
            target="_blank"
            rel="noreferrer noopener"
            className="external"
          >
            their mission
          </a>{" "}
          to support “web platform documentation for the benefit of web
          developers &amp; designers worldwide.” The team at OWD has led or
          contributed to many projects to improve documentation on MDN. They're
          an invaluable partner in the day-to-day work of making MDN.
        </p>
        <blockquote className="owd">
          <div className="partner">
            <h4>
              &nbsp;Open&nbsp;
              <br />
              &nbsp;Web&nbsp;Docs&nbsp;
            </h4>
            <a
              href="https://openwebdocs.org/"
              target="_blank"
              rel="noreferrer noopener"
              className="external"
            >
              openwebdocs.org
            </a>
          </div>
          <p>
            Our constant quest for innovation starts here, with you. Every part
            of MDN (docs, demos and the site itself) springs from our incredible
            open community of developers. Please join us!
          </p>
        </blockquote>
        <h2>Licensing</h2>
        <p>
          MDN's resources are entirely available under various open source
          licenses. Detailed information on licensing for reuse of MDN content,
          especially regarding copyrights and attribution, can be found{" "}
          <a href="/en-US/docs/MDN/About#using_mdn_web_docs_content">here.</a>
        </p>
        <h2>How to contribute</h2>
        <p>
          We are an open community of developers building resources for a better
          Web, regardless of brand, browser, or platform. Anyone can contribute
          and each person who does makes us stronger. Together we can continue
          to drive innovation on the Web to serve the greater good. It starts
          here, with you. Please,{" "}
          <a href="/en-US/docs/MDN/Contribute">join us</a>!
        </p>
        <p>
          No matter your specific level of expertise, individual strengths and
          interests in coding or writing, there are many ways for you to get
          involved and tackle important documentation tasks.
        </p>
        <p>
          Ready to become an active part of the MDN community but not sure where
          to begin? We've got you covered. See our step-by-step directions to{" "}
          <a
            href="https://github.com/mdn/content/#readme"
            target="_blank"
            rel="noreferrer noopener"
            className="external"
          >
            making your first contribution to MDN on GitHub
          </a>
          .
        </p>
      </section>
    </main>
  );
}
