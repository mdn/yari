import { useUserData } from "../../user-context";
import { isPlusAvailable } from "../../utils";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module './offer-hero'. Did you mean to... Remove this comment to see the full error message
import OfferHero from "./offer-hero";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module './offer-overview-feature'. Did... Remove this comment to see the full error message
import OfferOverviewFeatures from "./offer-overview-feature";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module './offer-overview-subscribe'. D... Remove this comment to see the full error message
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
