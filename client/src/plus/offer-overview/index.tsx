import { useEffect, useState } from "react";
import {
  ENABLE_PLUS_EU,
  FXA_SIGNIN_URL,
  MDN_PLUS_SUBSCRIBE_10M_URL,
  MDN_PLUS_SUBSCRIBE_10Y_URL,
  MDN_PLUS_SUBSCRIBE_5M_URL,
  MDN_PLUS_SUBSCRIBE_5Y_URL,
  MDN_PLUS_SUBSCRIBE_BASE,
} from "../../constants";
import { useOnlineStatus } from "../../hooks";
import { SubscriptionType, useUserData } from "../../user-context";
import { isPlusAvailable } from "../../utils";
import { getStripePlans } from "../common/api";
import OfferHero from "./offer-hero";
import OfferOverviewFeatures from "./offer-overview-feature";
import OfferOverviewSubscribe, {
  OfferDetailsProps,
  StripePlans,
} from "./offer-overview-subscribe";

const PLUS_FEATURES = [
  ["notifications", "Page notifications"],
  ["collections", "Collections of articles"],
  ["offline", "MDN Offline"],
];

function getLocalizedPlans(countrySpecific: StripePlans): {
  CORE: OfferDetailsProps;
  PLUS_5: OfferDetailsProps;
  PLUS_10: OfferDetailsProps;
} {
  return {
    CORE: CORE,
    PLUS_5: {
      ...PLUS_5,
      currency: countrySpecific.currency,
      regular: {
        ...PLUS_5.regular,
        ctaLink: `${MDN_PLUS_SUBSCRIBE_BASE}?plan=${countrySpecific.plans["mdn_plus_5m"].id}`,
        monthlyPrice: countrySpecific.plans["mdn_plus_5m"].monthlyPriceInCents,
      },
      discounted: {
        ...PLUS_5.discounted,
        ctaLink: `${MDN_PLUS_SUBSCRIBE_BASE}?plan=${countrySpecific.plans["mdn_plus_5y"].id}`,
        monthlyPrice: countrySpecific.plans["mdn_plus_5y"].monthlyPriceInCents,
      },
    },
    PLUS_10: {
      ...PLUS_10,
      currency: countrySpecific.currency,
      regular: {
        ...PLUS_10.regular,
        ctaLink: `${MDN_PLUS_SUBSCRIBE_BASE}?plan=${countrySpecific.plans["mdn_plus_10m"].id}`,
        monthlyPrice: countrySpecific.plans["mdn_plus_10m"].monthlyPriceInCents,
      },
      discounted: {
        ...PLUS_10.discounted,
        ctaLink: `${MDN_PLUS_SUBSCRIBE_BASE}?plan=${countrySpecific.plans["mdn_plus_10y"].id}`,
        monthlyPrice: countrySpecific.plans["mdn_plus_10y"].monthlyPriceInCents,
      },
    },
  };
}

const CORE: OfferDetailsProps = {
  id: "core",
  name: "Core",
  features: [
    ["notifications", "Notifications for up to 3 pages"],
    ["collections", "Up to 5 saved articles"],
  ],
  includes: "Includes:",
  cta: "Start with Core",
  regular: {
    subscriptionType: SubscriptionType.MDN_CORE,
    ctaLink: `${FXA_SIGNIN_URL}?next=/en-US/plus`,
  },
  discounted: {
    subscriptionType: SubscriptionType.MDN_CORE,
    ctaLink: `${FXA_SIGNIN_URL}?next=/en-US/plus`,
  },
};

const PLUS_5: OfferDetailsProps = {
  id: "plus5",
  name: "MDN Plus 5",
  currency: "USD",
  features: PLUS_FEATURES,
  includes: "Includes unlimited access to:",
  cta: "Start with Plus 5",
  upgradeCta: "Upgrade to Plus 5",
  regular: {
    subscriptionType: SubscriptionType.MDN_PLUS_5M,
    ctaLink: MDN_PLUS_SUBSCRIBE_5M_URL,
    monthlyPrice: 500,
  },
  discounted: {
    subscriptionType: SubscriptionType.MDN_PLUS_5Y,
    ctaLink: MDN_PLUS_SUBSCRIBE_5Y_URL,
    monthlyPrice: 417,
  },
};

const PLUS_10: OfferDetailsProps = {
  id: "plus10",
  name: "MDN Supporter 10",
  currency: "USD",
  features: [
    ...PLUS_FEATURES,
    [null, "Early access to new features"],
    [null, "Pride and joy"],
  ],
  includes: "Includes unlimited access to:",
  cta: "Start with Supporter 10",
  upgradeCta: "Upgrade to Supporter 10",
  regular: {
    subscriptionType: SubscriptionType.MDN_PLUS_10M,
    ctaLink: MDN_PLUS_SUBSCRIBE_10M_URL,
    monthlyPrice: 1000,
  },
  discounted: {
    subscriptionType: SubscriptionType.MDN_PLUS_10Y,
    ctaLink: MDN_PLUS_SUBSCRIBE_10Y_URL,
    monthlyPrice: 833,
  },
};

function OfferOverview() {
  const userData = useUserData();
  const plusAvailable = isPlusAvailable(userData);
  const [offerDetails, setOfferDetails] = useState<null | {
    CORE: OfferDetailsProps;
    PLUS_5: OfferDetailsProps | null;
    PLUS_10: OfferDetailsProps | null;
  }>(null);

  const { isOnline } = useOnlineStatus();
  const [plansLoading, setPlansLoading] = useState(false);

  useEffect(() => {
    (async () => {
      if (ENABLE_PLUS_EU && isOnline) {
        setPlansLoading(true);
        try {
          const plans: StripePlans = await getStripePlans();
          setOfferDetails(getLocalizedPlans(plans));
        } catch (error) {
          //Paid subs Not supported by region just display Free subscription
          setOfferDetails({ CORE: CORE, PLUS_5: null, PLUS_10: null });
        }
        setPlansLoading(false);
      }
    })();
  }, [isOnline]);

  return (
    <div className="offer-overview">
      <OfferHero
        isLoading={plansLoading}
        currency={offerDetails?.PLUS_5?.currency || ""}
        plusAvailable={plusAvailable}
      />
      <OfferOverviewFeatures />
      {plusAvailable && <OfferOverviewSubscribe offerDetails={offerDetails} />}
    </div>
  );
}

export default OfferOverview;
