import OfferHero from "./offer-hero";
import OfferOverviewFeatures from "./offer-overview-feature";
import OfferOverviewSubscribe from "./offer-overview-subscribe";

function OfferOverview() {
  return (
    <div className="offer-overview">
      <OfferHero />
      <OfferOverviewFeatures />
      <OfferOverviewSubscribe />
    </div>
  );
}

export default OfferOverview;
