import { useLocale } from "../hooks";
import { GetInvolved } from "../ui/molecules/get_involved";
import "./index.scss";

export default function About() {
  const locale = useLocale();
  return (
    <div className="about">
      <div className="about-container">
        <h1 className="mify">Build it better</h1>
        <p>
          MDN Web Docs is an open-source, collaborative project documenting Web
          platform technologies, including{" "}
          <a href={`/${locale}/docs/Web/CSS`}>CSS</a>,{" "}
          <a href={`/${locale}/docs/Web/HTML`}>HTML</a>,{" "}
          <a href={`/${locale}/docs/Web/JavaScript`}>JavaScript</a>, and{" "}
          <a href={`/${locale}/docs/Web/API/`}>Web APIs</a>. We also provide an
          extensive set of{" "}
          <a href={`/${locale}/docs/Learn`}>learning resources</a> for beginning
          developers and students.
        </p>

        <header>
          <span className="headline">
            <b>
              MDN's mission is to{" "}
              <u>provide a blueprint for a better internet</u> and empower a new
              generation of developers and content creators to build it.
            </b>
          </span>
        </header>
        <p>
          We're always striving to connect developers more seamlessly with the
          tools and information they need to easily build projects on the{" "}
          <a href="/">open Web</a>. Since our beginnings in 2005, Mozilla and
          the community have amassed around 45,000 pages of free, open-source
          content.
        </p>
        {/*<Testimonial />*/}
        <h2 className="_ify">
          Independent and unbiased - across browsers and technologies
        </h2>
        <p>
          This guiding principle has made MDN Web Docs the go-to repository of
          independent information for developers, regardless of brand, browser
          or platform. We are an open community of devs, writers, and other
          technologists building resources for a better Web, with over 17
          million monthly MDN users from all over the world. Anyone can
          contribute, and each of the 45,000 individuals who have done so over
          the past decades has strengthened and improved the resource. We also
          receive content contributions from our partners, including Microsoft,
          Google, Samsung, Igalia, W3C and others. Together we continue to drive
          innovation on the Web and serve the common good.
        </p>
        <h2 className="_ify">Accurate and vetted for quality</h2>
        <p>
          Through our GitHub documentation repository, contributors can make
          changes, submit pull requests, have their contributions reviewed and
          then merged with existing content. Through{" "}
          <a
            href="https://mdn-contributor-docs.mozilla.org/"
            target="_blank"
            rel="nofollow noreferrer"
          >
            this workflow
          </a>
          , we welcome the vast knowledge and experience of our developer
          community while maintaining a high level of quality, accurate content.
        </p>
      </div>
      <GetInvolved />
    </div>
  );
}
