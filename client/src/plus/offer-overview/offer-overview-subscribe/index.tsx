import "./index.scss";

function OfferOverviewSubscribe() {
  return (
    <div className="subscribe" id="subscribe">
      <h2>Choose a plan</h2>
      <div className="wrapper">
        <div className="subscribe-detail" id="annually">
          <span>
            <span className="sub-price">$4.19</span>
            <span className="sub-length">/month</span>
          </span>

          <p>
            ✓ Bookmarking
            <br />
            ✓ Notifications
            <br />
            ✓ MDN Offline
            <br />
            ✓ Access to all themes
            <br />
          </p>
          <a href="/">Get 12-month plan</a>
          <small>
            <i>$50 billed annually</i>
          </small>
        </div>
        <div className="subscribe-detail" id="monthly">
          <span>
            <span className="sub-price">$5</span>
            <span className="sub-length">/month</span>
          </span>
          <p>
            ✓ Bookmarking
            <br />
            ✓ Notifications
            <br />
            ✓ MDN Offline
            <br />
            ✓ Access to all themes
            <br />
          </p>
          <a href="/">Get monthly plan</a>
          <small>
            <i>$5 billed monthly</i>
          </small>
        </div>
      </div>
    </div>
  );
}

export default OfferOverviewSubscribe;
