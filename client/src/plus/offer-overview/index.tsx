import "./index.scss";
import OfferHero from "./offer-hero";
import OfferOverviewFeature from "./offer-overview-feature";
import OfferOverviewSubscribe from "./offer-overview-subscribe";

function OfferOverview() {
  return (
    <div className="offer-overview">
      <OfferHero />
      <OfferOverviewFeature />
      <OfferOverviewSubscribe />
    </div>
  );
}

export default OfferOverview;
