import { Button } from "../../../ui/atoms/button";
import "./index.scss";

function OfferOverviewFeature({ id, img, imgAlt, children }) {
  return (
    <div className={`offer-overview-feature`}>
      <div className="container">
        <div className="wrapper" id={id}>
          <img
            className="img-container"
            src={img}
            alt={imgAlt}
            width="320"
            height="320"
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
      <OfferOverviewFeature id="ai-help" img="/assets/ai-help.png" imgAlt="">
        <section aria-labelledby="ai-help-section-title">
          <h2 id="ai-help-section-title">AI Help</h2>
          <h3>Get real-time assistance and support.</h3>
          <p>
            No need to scroll through page after page to find your answers.
            Introducing an AI assistant that can answer all your web development
            questions in real time. Powered by OpenAI GPT 3.5.
          </p>
          <Button href="/en-US/plus/docs/features/ai-help" target="_self">
            Learn more →
          </Button>
        </section>
      </OfferOverviewFeature>
      <OfferOverviewFeature
        id="playground"
        img="/assets/playground.png"
        imgAlt=""
      >
        <section aria-labelledby="playground-section-title">
          <h2 id="playground-section-title">Playground</h2>
          <h3>Write,Test and Share your code.</h3>
          <p>
            Your playground to learn and share your amazing work with the world.
            By simply logging in, you can now spread your creativity far and
            wide.
          </p>
          <Button href="/en-US/plus/docs/features/playground" target="_self">
            Learn more →
          </Button>
        </section>
      </OfferOverviewFeature>
      <OfferOverviewFeature id="updates" img="/assets/updates.png" imgAlt="">
        <section aria-labelledby="updates-section-title">
          <h2 id="updates-section-title">Updates</h2>
          <h3>
            Compatibility changes at a glance.
            <br />
            Filter and sort updates that matter most to build your project
          </h3>
          <p>
            The Web doesn't have a changelog, but MDN can help. You can
            personalize and filter compatibility changes based on browsers or
            the tech category you are interested in whether that is JavaScript,
            CSS, etc.
          </p>
          <Button href="/en-US/plus/docs/features/updates" target="_self">
            Learn more →
          </Button>
        </section>
      </OfferOverviewFeature>
      <OfferOverviewFeature
        id="collections"
        img="/assets/collections.png"
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
          <Button href="/en-US/plus/docs/features/collections" target="_self">
            Learn more →
          </Button>
        </section>
      </OfferOverviewFeature>
      <OfferOverviewFeature id="offline" img="/assets/offline.png" imgAlt="">
        <section aria-labelledby="offline-section-title">
          <h2 id="offline-section-title">MDN Offline</h2>
          <h3>MDN's entire library at your fingertips: offline</h3>
          <p>
            Taking your projects beyond the nearest wifi signal? Say goodbye to
            inaccessible pages or cluttered tabs. With MDN Plus, have the fully
            navigable resources of MDN at your disposal even when offline.
          </p>
          <Button href="/en-US/plus/docs/features/offline" target="_self">
            Learn more →
          </Button>
        </section>
      </OfferOverviewFeature>
      <OfferOverviewFeature id="afree" img="/assets/afree.png" imgAlt="">
        <section aria-labelledby="afree-section-title">
          <h2 id="afree-section-title">Go ads free</h2>
          <h3>Enjoy MDN ads-free with an MDN Plus subscription.</h3>
          <p>
            Support MDN and enjoy a focused, ad-free experience alongside other
            features such as curated collections, custom web platform updates,
            offline access, and more. Subscribers to paid tiers of MDN Plus have
            the option to browse MDN without ads.
          </p>
          <Button href="/en-US/advertising" target="_self">
            Learn more →
          </Button>
        </section>
      </OfferOverviewFeature>
    </section>
  );
}
