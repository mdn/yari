import React from "react";
import "./index.scss";

const GLOBE = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 420 420"
    stroke="#000"
    fill="none"
    role="img"
  >
    <title>a globe</title>
    <path stroke-width="26" d="M209,15a195,195 0 1,0 2,0z" />
    <path
      stroke-width="18"
      d="m210,15v390m195-195H15M59,90a260,260 0 0,0 302,0 m0,240 a260,260 0 0,0-302,0M195,20a250,250 0 0,0 0,382 m30,0 a250,250 0 0,0 0-382"
    />
  </svg>
);
const STATS = [
  { id: 1, number: "17M", legend: "unique monthly users" },
  { id: 2, number: ">80M", legend: "page views per month" },
  { id: 3, number: "17", legend: "years of trust" },
  {
    id: 4,
    number: GLOBE,
    legend: "worldwide distribution",
  },
];

export function AdvertiseWithUs() {
  React.useEffect(() => {
    document.title = "Advertise with us | MDN";
  }, []);

  return (
    <main className="advertise-with-us">
      <div className="stats-container dark">
        <section className="stats-header">
          <h1>Tell it better</h1>
          <ul className="stats">
            {STATS.map((s) => (
              <li key={s.id}>
                <span className="number">{s.number}</span>
                <span className="legend">{s.legend}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <section>
        <h2>Join MDN's Privacy-First Ad Journey</h2>
        <p>
          At MDN, we champion user privacy and we stand by{" "}
          <a
            href="https://www.mozilla.org/en-US/privacy/ad-targeting-guidelines/"
            target="_blank"
            rel="noreferrer"
            className="external"
          >
            Mozilla's Ad targeting guidelines
          </a>
          . We pride ourselves with an ethical advertising approach that ensures
          ads are context-based, free from tracking pixels, and don't involve
          personal data sharing.
        </p>
        <p>
          While we understand that advertisers rely on attribution to gauge
          campaign effectiveness, we also find that current methods pose privacy
          concerns. In line with our vision of protecting user privacy and
          personal data, Mozilla is part of a working group to develop
          Interoperable Private Attribution (IPA), a privacy-preserving
          attribution solution. We aim to enable attribution without tracking,
          enhancing ad quality and value.
        </p>
        <p>
          Until this becomes a reality, we are working with advertising partners
          who support our privacy goals. For now, that means collaborating
          without attribution and developing a better way together.{" "}
          <a
            href="https://survey.alchemer.com/s3/7212589/MDN-Advertise-with-us"
            target="_blank"
            rel="noreferrer"
            className="external"
          >
            Join us
          </a>{" "}
          in this journey!
        </p>
        <h2>Our offering</h2>
        <p>
          We collaborate with vetted advertisers who share our vision for web
          development. We display at most two static ads per page. We offer
          exclusive opportunities for prominent homepage visibility, providing
          advertisers a unique way to capture our audience's attention. We are
          also happy to collaborate on writing and publishing sponsored content
          on our blog.
        </p>
        <h2>Our audience</h2>
        <p>
          MDN is a go-to resource for over 17 million web developers monthly,
          providing open-source documentation on CSS, HTML, JavaScript, and Web
          APIs. We boast 90% customer satisfaction and offer comprehensive
          learning materials for beginners, who make up about 10% of our
          audience.
        </p>
        <h2>Partner with us</h2>
        <p>
          Ready to advertise on MDN? Complete{" "}
          <a
            href="https://survey.alchemer.com/s3/7212589/MDN-Advertise-with-us"
            target="_blank"
            rel="noreferrer"
            className="external"
          >
            this form
          </a>
          , and we'll respond shortly. Discover more about{" "}
          <a
            href="https://www.mozilla.org/en-US/privacy/ad-targeting-guidelines/"
            target="_blank"
            rel="noreferrer"
            className="external"
          >
            Mozilla's Ad targeting guidelines
          </a>{" "}
          and{" "}
          <a
            href="https://www.mozilla.org/en-US/privacy/"
            target="_blank"
            rel="noreferrer"
            className="external"
          >
            Privacy policy
          </a>
          .
        </p>
      </section>
    </main>
  );
}
