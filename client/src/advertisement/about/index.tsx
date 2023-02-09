import React from "react";
import "./index.scss";

export function About() {
  React.useEffect(() => {
    document.title = "Finding the Right Mix";
  }, []);

  return (
    <div className="about">
      <div className="about-container">
        <h1 className="mify">
          Finding the Right Mix: <span>Balancing Relevance and Respect</span>
        </h1>
        <p>
          MDN has been a valuable resource for web developers since 2005,
          consistently supported and improved by Mozilla and its community.
          <br />
          With over 17 million unique monthly users, it is widely used and also
          integrated into other solutions. Running such a large project requires
          a significant amount of resources, including dedicated writing,
          engineering, and infrastructure.
        </p>
        <p>
          In 2022, we{" "}
          <a
            href="https://hacks.mozilla.org/2022/03/introducing-mdn-plus-make-mdn-your-own/"
            target="_blank"
            rel="noreferrer"
            className="external"
          >
            launched MDN Plus
          </a>
          , a premium offering to provide a personalized and more powerful
          experience while continuing to invest in our always free and open
          webdocs. MDN Plus has shown promising results so far, reflecting the
          trust developers have in both the product and the brand. However,
          additional investment is needed to sustain the running of the project.
          In response, we have decided to experiment with partnerships and
          contextual advertising on MDN. Between February 15th and March 30th,
          we will be running a 6-week trial in the US, Canada, and selected
          European markets.
        </p>
        <p>
          Advertisers rely on attribution to measure the effectiveness of their
          advertising campaigns. Attribution provides metrics that give
          advertisers insights into their campaign performance, while also
          helping publishers understand their role in supporting advertisers.
          Despite its significance, current attribution methods have many
          privacy concerns. In line with Mozilla's vision of protecting user
          privacy and personal data, over the past year, Mozilla has been a part
          of a working group developing a new proposal called Interoperable
          Private Attribution (IPA) to enable conversion measurement
          (attribution) for advertising while maintaining strong privacy
          protection. IPA provides advertisers with the ability to measure the
          effectiveness of their campaigns while ensuring user privacy. You can
          find additional information on the topic in{" "}
          <a
            href="https://blog.mozilla.org/en/mozilla/privacy-preserving-attribution-for-advertising/"
            target="_blank"
            rel="noreferrer"
            className="external"
          >
            this blogpost
          </a>
          .
        </p>
        <p>
          Our commitment to user privacy and data protection remains a top
          priority, and we stand by{" "}
          <a
            href="https://www.mozilla.org/privacy/ad-targeting-guidelines/"
            target="_blank"
            rel="noreferrer"
          >
            Mozilla's Ad targeting guidelines
          </a>
          . For this trial, MDN's ads will be strictly context-based and will
          not include tracking pixels or personal data sharing. Our goal though
          is to advance the Interoperable Private Attribution work in the months
          to come and strike a balance between providing relevant ads and
          respecting our users' privacy.
        </p>
        <p>
          During the experiment, we will work with three carefully chosen and
          vetted advertisers who align with our vision for web development. To
          minimize disruption, we will display only one static ad per page. MDN
          Plus subscribers will have the option to turn off ads through their
          account settings.
        </p>
        <p>
          We believe this change will make MDN even more resilient and capable
          of offering free and accessible resources to developers around the
          world. We have a newly created, publicly available roadmap,{" "}
          <a href="/TODO" target="_blank" rel="noreferrer">
            developed in collaboration
          </a>{" "}
          with our partners from W3C, Microsoft, Google, and Open Web Docs. You
          are welcome to check it out{" "}
          <a
            href="https://github.com/orgs/mdn/projects/26/views/7"
            target="_blank"
            rel="noreferrer"
          >
            here
          </a>
          .
        </p>
        <p>
          We have a{" "}
          <a
            href="https://github.com/orgs/mdn/discussions/categories/project"
            target="_blank"
            rel="noreferrer"
          >
            Github discussion forum
          </a>{" "}
          that is thriving, many of our active community members are there, and
          we invite you to reach out with feedback and questions.
        </p>
        <p>
          We remain committed to building a better open web and improving our
          users' experiences. We believe in the power of information and the
          importance of an accessible and trustworthy source of it. Thank you
          for being a part of this journey and we encourage you to stay tuned
          for what's to come. We are excited to continue working towards a
          better future together.
        </p>
        <p>
          Interested to be part of this journey? Check out our{" "}
          <a href="/en-US/advertisement/with_us">Advertise with us</a> page and
          get in contact with us.
        </p>
      </div>
    </div>
  );
}
