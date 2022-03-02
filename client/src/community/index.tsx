import { Quote } from "../ui/molecules/quote";
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
        <h2>Our volunteer community</h2>
        <p>
          The power of MDN lies in its vast, vital community of active users and
          contributors. Since 2005, approximately 45,000 contributors have
          created the documentation we know and love. Together, contributors
          have created over 45,000 documents that make up an up-to-date,
          comprehensive, and free resource for web developers around the world.
          In addition to English-language articles,{" "}
          <a href="/en-US/docs/MDN/Contribute/Localize">
            over 35 volunteers lead translation and localization efforts
          </a>{" "}
          for Chinese, French, Japanese, Korean, Portuguese, Russian, and
          Spanish. With over 200 commits per week, the culture of active
          contribution is going strong. And you can be a part of it.
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
        <Quote
          name="Dan Appelquist"
          title="Samsung Internet (charter member of the Product
              Advisory Board)"
          extraClasses="pab dark"
        >
          MDN has a unique place right now as a vendor-neutral and authoritative
          documentation and information resource for web developers. The MDN PAB
          has helped to bring feedback from the wider web community (including
          standards engineers, web browser makers and open source developers)
          into MDN to help keep it strong. As a member of the web community and
          a fan of MDN it’s been great to be a part of.
        </Quote>
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
          an invaluable partner in the day-to-day work of making MDN. Read more
          about OWD’s activities in their{" "}
          <a
            href="https://github.com/openwebdocs/project/tree/main/impact-report-2021"
            target="_blank"
            rel="noreferrer noopener"
            className="external"
          >
            2021 Impact and Transparency Report
          </a>{" "}
          and get continuous updates on their{" "}
          <a
            href="https://twitter.com/openwebdocs"
            target="_blank"
            rel="noreferrer noopener"
            className="external"
          >
            Twitter
          </a>{" "}
          account.
        </p>
        <Quote
          name="Florian Scholz"
          title="Content Lead"
          org="Open Web Docs"
          extraClasses="owd dark"
        >
          Open Web Docs strongly believes in MDN as critical infrastructure for
          the web platform. As a vendor-neutral organization, we are supporting
          MDN with an independent editorial voice and with the needs of the
          global community of web developers and designers in mind.
        </Quote>
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
