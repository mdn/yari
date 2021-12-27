import { GetInvolved } from "./get_involved";
import "./index.scss";
import { Testimonial } from "./testimonial";

export function About() {
  return (
    <div className="about">
      <div className="about-container">
        <header>
          <span className="about-logo">*</span>
          <h1>
            MDN's mission is simple:
            <b> Provide a blueprint for a better internet</b> and empower a new
            generation of developers and content creators to build it.
          </h1>
        </header>

        <p>
          MDN Docs is a dynamic, ever-evolving learning platform, an
          open-source, collaborative project documenting the software and
          languages that power the Web and essential applications, including
          CSS, HTML, JavaScript and Web APIs. We also provide an extensive set
          of learning resources for beginning developers and students.
        </p>
        <p>
          We're always striving to connect developers more seamlessly with the
          tools and information they need to easily build projects on the open
          Web. If it's an open technology exposed to the Web, we want to
          document it. Since our beginnings in 2005, we've amassed around 45,000
          pages of free, open-source content.
        </p>
        <Testimonial />
        <h2>
          Independent and unbiased - <br />
          across browsers and technologies
        </h2>
        <p>
          This guiding principle has made MDN Docs the go-to repository of
          independent, unbiased information for developers, regardless of brand,
          browser or platform. We are an open community of devs building
          resources for a better Web, with over 17 million monthly MDN users
          from all over the world.
        </p>
        <p>
          Anyone can contribute, and each of the 56,000 individuals who have
          done so over the past 16 years has strengthened and improved the
          resource. We also receive content contributions from our partners,
          including Microsoft, Google, Samsung, Igalia, W3C and others. Together
          we continue to drive innovation on the Web and serve the common good.
        </p>
        <Testimonial />
        <h2>Accurate and vetted for quality</h2>
        <p>
          Through our GitHub documentation repository, contributors can make
          changes, submit pull requests, have their contributions reviewed and
          then merged with existing content. Through this workflow, we welcome
          the vast knowledge and experience of our developer community while
          maintaining a high level of quality, accurate content.
        </p>
      </div>
      <GetInvolved />
      <div className="about-bg" />
    </div>
  );
}
