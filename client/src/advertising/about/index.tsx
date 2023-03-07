import React from "react";
import { useUserData } from "../../user-context";
import { isPlusSubscriber } from "../../utils";
import "./index.scss";

export function About() {
  React.useEffect(() => {
    document.title = "Experimenting with advertising on MDN | MDN";
  }, []);
  const user = useUserData();

  return (
    <div className="ads-about">
      <div className="about-container">
        <h1 className="mify">Experimenting with advertising on MDN</h1>
        <h2>About</h2>
        <p>
          <a href="/">MDN</a> has been a valuable resource for web developers
          since 2005, consistently supported and improved by Mozilla and its
          community. With over 17 million unique monthly users, it is widely
          used and also integrated into other solutions.
        </p>
        <p>
          Starting February 15th and for the next six weeks, we will experiment
          with partnerships and contextual advertising on MDN in the US, Canada,
          Australia, New Zealand and selected European countries.
        </p>
        <p>
          We believe this addition will make MDN even more resilient and capable
          of offering free and accessible resources to developers around the
          world.
        </p>
        <p>
          We have a newly created, publicly available roadmap,{" "}
          <a
            href="https://blog.mozilla.org/en/mozilla/mdn-web-documentation-collaboration/"
            target="_blank"
            rel="noreferrer"
            className="external"
          >
            developed in collaboration
          </a>{" "}
          with our partners from W3C, Microsoft, Google, and Open Web Docs. You
          are welcome to check it out{" "}
          <a
            href="https://github.com/orgs/mdn/projects/26/views/7"
            target="_blank"
            rel="noreferrer"
            className="external"
          >
            here
          </a>
          .
        </p>
        <h2>Privacy first</h2>
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
          . MDN's ads will be strictly context-based and will not include
          tracking pixels or personal data sharing.
        </p>
        <p>
          For this experiment, we will work with carefully chosen and vetted
          advertisers who align with our vision for web development and we will
          display at most one static ad per page.{" "}
          <a href="/en-US/plus">MDN Plus subscribers</a> will have the option to{" "}
          {isPlusSubscriber(user) ? (
            <a href="/en-US/plus/settings">turn off</a>
          ) : (
            "turn off"
          )}{" "}
          ads through their account settings.
        </p>
        <p>
          Advertisers rely on attribution to measure the effectiveness of their
          advertising campaigns. Attribution provides metrics that give
          advertisers insights into their campaign performance, while also
          helping publishers understand their role in supporting advertisers.
          Despite its significance, current attribution methods have many
          privacy concerns.
        </p>
        <p>
          In line with Mozilla's vision of protecting user privacy and personal
          data, over the past year, Mozilla has been a part of a working group
          developing a new proposal called Interoperable Private Attribution
          (IPA) to enable attribution while maintaining strong privacy
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
          . Mozilla’s and MDN’s goal is to advance the Interoperable Private
          Attribution work in the months to come.
        </p>
        <p>
          We are working with advertising partners who are supportive of our
          privacy goals. For now, that means working without attribution. Our
          eventual goal is to enable attribution without tracking, which will
          improve the quality and value of the ads we show.
        </p>
        <h2>We want to hear from you</h2>
        <p>
          We have a{" "}
          <a
            href="https://github.com/orgs/mdn/discussions"
            target="_blank"
            rel="noreferrer"
            className="external"
          >
            GitHub discussion forum
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
        <p className="cta">
          Interested to be part of this journey? Check out our{" "}
          <a href="/en-US/advertising/with_us">Advertise with us</a> page and
          get in contact with us.
        </p>
      </div>
    </div>
  );
}
