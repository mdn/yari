import { Button } from "../../../ui/atoms/button";
import "./index.scss";

function OfferOverviewFeature({ id, img, imgAlt, children }) {
  return (
    <div className={`offer-overview-feature ${id}`}>
      <div className="container">
        <div className="wrapper" id={id}>
          <img
            className="img-container"
            src={img}
            alt={imgAlt}
            width="1600"
            height="900"
          ></img>
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
        id="notifications"
        img="/assets/notifications_light.png"
        imgAlt=""
      >
        <section aria-labelledby="notifications-section-title">
          <h2 id="notifications-section-title">Notifications</h2>
          <h3>
            Development in real time:
            <br />
            Get custom alerts
          </h3>
          <p>
            The Web doesn't have a changelog, but MDN can help. Follow pages and
            get customizable notifications when documentation changes, CSS
            features launch, and APIs ship.
          </p>
          <Button href="./docs/features/notifications">Learn more →</Button>
        </section>
      </OfferOverviewFeature>
      <OfferOverviewFeature
        id="collections"
        img="/assets/notifications_light.png"
        imgAlt=""
      >
        <section aria-labelledby="collections-section-title">
          <h2 id="collections-section-title">Collections</h2>
          <h3>
            Build your perfect library. <br />
            Or let us build it for you.
          </h3>
          <p>
            No more haphazard hunting through the vast virtual library: unleash
            your inner curator and collect your favorite articles in one place
            for convenient consultation.
          </p>
          <Button href="./docs/features/collections">Learn more →</Button>
        </section>
      </OfferOverviewFeature>
      <OfferOverviewFeature
        id="offline"
        img="/assets/notifications_light.png"
        imgAlt=""
      >
        <section aria-labelledby="offline-section-title">
          <h2 id="offline-section-title">MDN Offline</h2>
          <h3>MDN's entire library at your fingertips: offline</h3>
          <p>
            Taking your projects beyond the nearest wifi signal? Say goodbye to
            inaccessible pages or cluttered tabs. With MDN Plus, have the fully
            navigable resources of MDN at your disposal even when offline.
          </p>
          <Button href="./docs/features/offline">Learn more →</Button>
        </section>
      </OfferOverviewFeature>
    </section>
  );
}
