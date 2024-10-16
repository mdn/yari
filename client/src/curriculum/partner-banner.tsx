import ThemedPicture from "../ui/atoms/themed-picture";
import { useGleanClick } from "../telemetry/glean-context";
import { useViewed } from "../hooks";
import { CURRICULUM } from "../telemetry/constants";

import bannerDark from "../../public/assets/curriculum/curriculum-partner-banner-illustration-large-dark.svg";
import bannerLight from "../../public/assets/curriculum/curriculum-partner-banner-illustration-large-light.svg";

import "./partner-banner.scss";

export function PartnerBanner() {
  const gleanClick = useGleanClick();
  const observedNode = useViewed(() => {
    gleanClick(`${CURRICULUM}: partner banner view`);
  });

  return (
    <section className="curriculum-partner-banner-container" ref={observedNode}>
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
