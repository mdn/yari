import ThemedPicture from "../ui/atoms/themed-picture";
import bannerDark from "../../public/assets/curriculum/curriculum-partner-banner-illustration-large-dark.svg";
import bannerLight from "../../public/assets/curriculum/curriculum-partner-banner-illustration-large-light.svg";

import "./partner-banner.scss";

export function PartnerBanner() {
  return (
    <section className="curriculum-partner-banner-container">
      <div className="partner-banner">
        <section>
          <h2>Learn the curriculum with Scrimba and become job ready</h2>
          <p>
            <a
              href="https://scrimba.com/learn/frontend?via=mdn"
              target="_blank"
              rel="origin noreferrer"
              className="external"
            >
              Scrimba's Frontend Developer Career Path
            </a>{" "}
            teaches the MDN Curriculum Core with fun interactive lessons and
            challenges, knowledgeable teachers, and a supportive community. Go
            from zero to landing your first front-end job!
          </p>
          <a
            href="https://scrimba.com/learn/frontend?via=mdn"
            target="_blank"
            rel="origin noreferrer"
            className="external"
          >
            Find out more
          </a>
        </section>

        <ThemedPicture srcDark={bannerDark} srcLight={bannerLight} alt="" />
      </div>
    </section>
  );
}
