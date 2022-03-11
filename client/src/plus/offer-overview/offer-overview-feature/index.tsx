import { Button } from "../../../ui/atoms/button";
import "./index.scss";

function OfferOverviewFeature({ id, img, imgAlt, children }) {
  return (
    <div className={`offer-overview-feature ${id}`}>
      <div className="container">
        <div className="wrapper" id={id}>
          <div className="img-container">
            <img src={img} alt={imgAlt}></img>
          </div>
          <div className="copy-container">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function OfferOverviewFeatures() {
  return (
    <section id="features">
      <OfferOverviewFeature
        id="bookmarking"
        img="/assets/notifications_light.png"
        imgAlt=""
      >
        <h2>Development in real time: Get custom alerts</h2>
        <p>
          The Web doesn't have a changelog, but MDN can help. Follow pages and
          get customizable notifications when documentation changes, CSS
          features launch, and APIs ship.
        </p>
        <Button href="plus/feature-highlight">Learn more →</Button>
      </OfferOverviewFeature>
      <OfferOverviewFeature
        id="offline"
        img="/assets/notifications_light.png"
        imgAlt=""
      >
        <h2>MDN's entire library at your fingertips: offline</h2>
        <p>
          Taking your projects beyond the nearest wifi signal? Say goodbye to
          inaccessible pages or cluttered tabs. With MDN Plus, have the fully
          navigable resources of MDN at your disposal even when offline.
        </p>
        <Button href="plus/feature-highlight">Learn more →</Button>
      </OfferOverviewFeature>
      <OfferOverviewFeature
        id="bookmarking"
        img="/assets/notifications_light.png"
        imgAlt=""
      >
        <h2>
          Build your perfect library. <br />
          Or let us build it for you.
        </h2>
        <p>
          No more haphazard hunting through the vast virtual library: unleash
          your inner curator and collect your favorite articles in one place for
          convenient consultation.
        </p>
        <Button href="plus/feature-highlight">Learn more →</Button>
      </OfferOverviewFeature>
    </section>
  );
}
