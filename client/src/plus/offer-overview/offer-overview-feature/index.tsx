import "./index.scss";
import placeholder_1 from "./placeholder_1.png";
import placeholder_2 from "./placeholder_2.png";

function OfferOverviewFeature() {
  return (
    <div>
      <div className="offer-overview-feature bookmarking" id="features">
        <div className="wrapper" id="bookmarking">
          <div className="copy-container">
            <h2>Create multi-channel campaigns with ease</h2>
            <p>
              Start engaging your customers with automated campaigns across
              email, SMS, social, and onsite pop ups - all from a single
              platform.
            </p>
            <a>Learn more -&gt;</a>
          </div>
          <div className="img-container">
            <img src={placeholder_1} alt="bookmarking section hero"></img>
          </div>
        </div>
      </div>
      <div className="offer-overview-feature notifications">
        <div className="wrapper" id="notifications">
          <div className="img-container">
            <img src={placeholder_2} alt="notifications section hero"></img>
          </div>
          <div className="copy-container">
            <h2>Create multi-channel campaigns with ease</h2>
            <p>
              Start engaging your customers with automated campaigns across
              email, SMS, social, and onsite pop ups - all from a single
              platform.
            </p>
            <a>Learn more -&gt;</a>
          </div>
        </div>
      </div>
      <div className="offer-overview-feature offline">
        <div className="wrapper" id="offline">
          <div className="copy-container">
            <h2>Create multi-channel campaigns with ease</h2>
            <p>
              Start engaging your customers with automated campaigns across
              email, SMS, social, and onsite pop ups - all from a single
              platform.
            </p>
            <a>Learn more -&gt;</a>
          </div>
          <div className="img-container">
            <img src={placeholder_1} alt="offline section hero"></img>
          </div>
        </div>
      </div>
      <div className="offer-overview-feature themes">
        <div className="wrapper" id="themes">
          <div className="img-container">
            <img src={placeholder_2} alt="themes section hero"></img>
          </div>
          <div className="copy-container">
            <h2>Create multi-channel campaigns with ease</h2>
            <p>
              Start engaging your customers with automated campaigns across
              email, SMS, social, and onsite pop ups - all from a single
              platform.
            </p>
            <a>Learn more -&gt;</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OfferOverviewFeature;
