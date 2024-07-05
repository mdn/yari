import ThemedPicture from "../ui/atoms/themed-picture";
import bannerDark from "../../public/assets/curriculum/curriculum-partner-banner-illustration-large-dark.svg";
import bannerLight from "../../public/assets/curriculum/curriculum-partner-banner-illustration-large-light.svg";

import "./partner-banner.scss";

export function PartnerBanner() {
  return (
    <section className="partner-banner-container">
      <div className="partner-banner">
        <section>
          <h2>
            Learn the curriculum with{" "}
            <a href="https://scrimba.com?via=mdn" className="external">
              Scrimba
            </a>{" "}
            and become job ready
          </h2>
          <p>
            Scrimba's Frontend Developer Career Path teaches the MDN Curriculum
            Core with fun interactive lessons and challenges, knowledgeable
            teachers, and a supportive community. Go from zero to landing your
            first front-end job!
          </p>
          <a
            href="https://scrimba.com/learn/frontend?via=mdn"
            target="_blank"
            rel="noreferrer"
            className="external"
          >
            Find out more
          </a>
        </section>

        <ThemedPicture
          srcDark={bannerDark}
          srcLight={bannerLight}
          alt="Screenshot of AI Help"
        />
      </div>
    </section>
  );
}
