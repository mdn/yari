import "./index.scss";
import OfferHero from "./offer-hero";
import OfferOverviewFeature from "./offer-overview-feature";

function OfferOverview() {
  return (
    <div className="offer-overview">
      <OfferHero />
      <OfferOverviewFeature />
    </div>
  );
}

export default OfferOverview;
