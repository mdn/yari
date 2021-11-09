import "./index.scss";
import {
  MDN_PLUS_SUBSCRIBE_MONTHLY_URL,
  MDN_PLUS_SUBSCRIBE_YEARLY_URL,
} from "../../../constants";

function OfferOverviewSubscribe() {
  return (
    <div className="subscribe" id="subscribe">
      <h2>Choose a plan</h2>
      <div className="wrapper">
        <div className="subscribe-detail" id="annually">
          <div className="tagline">Save 20%</div>
          <div className="content">
            <div className="sub-info">
              Yearly
              <span>
                <span className="sub-price">$4.80</span>
                <span className="sub-length">/month</span>
              </span>
              <span>
                <i>$57.60 billed annually</i>
              </span>
            </div>
            <ul>
              <li>Bookmarking</li>
              <li>Notifications</li>
              <li>MDN Offline</li>
              <li>Access to all themes</li>
            </ul>
            <a href={MDN_PLUS_SUBSCRIBE_YEARLY_URL}>Get yearly plan</a>
            <span className="terms">See terms and conditions</span>
          </div>
        </div>
        <div className="subscribe-detail" id="monthly">
          <div className="content">
            <div className="sub-info">
              Monthly
              <span>
                <span className="sub-price">$6</span>
                <span className="sub-length">/month</span>
              </span>
              <span>
                <i>Billed monthly</i>
              </span>
            </div>
            <ul>
              <li>Bookmarking</li>
              <li>Notifications</li>
              <li>MDN Offline</li>
              <li>Access to all themes</li>
            </ul>
            <a href={MDN_PLUS_SUBSCRIBE_MONTHLY_URL}>Get monthly plan</a>
            <span className="terms">See terms and conditions</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OfferOverviewSubscribe;
