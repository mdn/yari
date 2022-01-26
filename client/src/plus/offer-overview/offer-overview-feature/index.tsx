import "./index.scss";
import placeholder_1 from "./placeholder_1.svg";

function OfferOverviewFeature() {
  return (
    <div>
      <div className="offer-overview-feature bookmarking" id="features">
        <div className="wrapper" id="bookmarking">
          <div className="copy-container">
            <h2>Development in real time: Get custom alerts</h2>
            <p>
              The Web doesn't have a changelog, but MDN can help. Follow content
              and get customizable notifications when documentation changes, CSS
              features launch, and APIs ship.
            </p>
            <a href="plus/feature-highlight">Learn more →</a>
          </div>
          <div className="img-container">
            <img src={placeholder_1} alt="bookmarking section hero"></img>
          </div>
        </div>
      </div>
      <div className="offer-overview-feature notifications">
        <div className="wrapper" id="notifications">
          <div className="img-container">
            <img src={placeholder_1} alt="notifications section hero"></img>
          </div>
          <div className="copy-container">
            <h2>MDN's entire library at your fingertips: offline</h2>
            <p>
              Taking your projects beyond the nearest wifi signal? Say goodbye
              to inaccessible pages or cluttered tabs. With MDN Plus, have the
              fully navigable resources of MDN at your disposal on iOS or
              Android, even when offline.
            </p>
            <a href="plus/feature-highlight">Learn more →</a>
          </div>
        </div>
      </div>
      <div className="offer-overview-feature offline">
        <div className="wrapper" id="offline">
          <div className="copy-container">
            <h2>
              Build your perfect library. <br />
              Or let us build it for you.
            </h2>
            <p>
              No more haphazard hunting through the vast virtual library:
              unleash your inner curator and collect your favorite articles in
              one place for convenient consultation.
            </p>
            <a href="plus/feature-highlight">Learn more →</a>
          </div>
          <div className="img-container">
            <img src={placeholder_1} alt="offline section hero"></img>
          </div>
        </div>
      </div>
      <div className="offer-overview-feature themes">
        <div className="wrapper" id="themes">
          <div className="img-container">
            <img src={placeholder_1} alt="themes section hero"></img>
          </div>
          <div className="copy-container">
            <h2>Make MDN your own</h2>
            <p>
              Turn MDN into a reflection of your personality. Go light, dark, or
              personalize your browsing experience with themes from Colorways.
            </p>
            <a href="plus/feature-highlight">Learn more →</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OfferOverviewFeature;
