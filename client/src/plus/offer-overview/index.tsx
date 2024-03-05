import { useScrollToAnchor } from "../../hooks";
import OfferHero from "./offer-hero";
import OfferOverviewFeatures from "./offer-overview-feature";
import OfferOverviewSubscribe from "./offer-overview-subscribe";

function OfferOverview() {
  useScrollToAnchor();
  return (
    <div className="offer-overview">
      <OfferHero />
      <OfferOverviewFeatures />
      <OfferOverviewSubscribe />
    </div>
  );
}

export default OfferOverview;
