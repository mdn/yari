import React from "react";
import "./index.scss";

const STATS = [
  { id: 1, number: "17M", legend: "unique monthly users" },
  { id: 2, number: ">80M", legend: "page views per month" },
  { id: 3, number: "17years", legend: "trusted for over" },
  { id: 4, number: "Worldwide", legend: "distribution" },
];

export function AdvertiseWithUs() {
  React.useEffect(() => {
    document.title = "Advertise with us";
  }, []);

  return (
    <main className="contribute">
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
        <h2>Our audience</h2>
        <p>
          MDN is an open source documentation resource for web developers. It
          primarily consists of reference and educational documentation on a
          wide variety of subjects, including
          <a href="/en-US/docs/Web/CSS"> CSS</a>,
          <a href="/en-US/docs/Web/HTML"> HTML</a>,
          <a href="/en-US/docs/Web/JavaScript"> JavaScript</a>, and
          <a href="/en-US/docs/Web/API/"> Web APIs</a>. We also provide an
          extensive set of
          <a href="/en-US/docs/Learn"> learning resources</a> for beginning
          developers and students, accounting for approximately 10% of our
          audience. More than 17 million web developers visit our website every
          month, and we pride ourselves with a customer satisfaction of over
          90%.
        </p>
        <h2>Our offer</h2>
        <p>
          We are currently experimenting with the first ads campaigns on MDN.
          You can check this page for more information about the 'Why' and the
          'How' of the experiments.
        </p>
        <p>
          If you are interested in advertising with us, please fill out{" "}
          <a
            href="https://survey.alchemer.com/s3/7212589/MDN-Advertise-with-us"
            target="_blank"
            rel="noreferrer"
          >
            this form
          </a>{" "}
          and we'll make sure to get back to you very soon. Learn more about our
          advertising principles and policies{" "}
          <a
            href="https://www.mozilla.org/en-US/privacy/ad-targeting-guidelines/"
            target="_blank"
            rel="noreferrer"
          >
            here
          </a>
          .
        </p>
      </section>
    </main>
  );
}
