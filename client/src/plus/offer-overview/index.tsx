import { useUserData } from "../../user-context";
import { isPlusAvailable } from "../../utils";
import "./index.scss";
import OfferHero from "./offer-hero";
import OfferOverviewFeatures from "./offer-overview-feature";
import OfferOverviewSubscribe from "./offer-overview-subscribe";

function OfferOverview() {
  const userData = useUserData();
  const plusAvailable = isPlusAvailable(userData);
  return (
    <div className="offer-overview">
      <OfferHero plusAvailable={plusAvailable} />
      <OfferOverviewFeatures />
      {plusAvailable && <OfferOverviewSubscribe />}
    </div>
  );
}

export default OfferOverview;
