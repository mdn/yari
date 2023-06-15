import "./index.scss";
import {
  FXA_SIGNIN_URL,
  MDN_PLUS_SUBSCRIBE_10M_URL,
  MDN_PLUS_SUBSCRIBE_10Y_URL,
  MDN_PLUS_SUBSCRIBE_5M_URL,
  MDN_PLUS_SUBSCRIBE_5Y_URL,
  MDN_PLUS_SUBSCRIBE_BASE,
} from "../../../env";
import { SubscriptionType, UserData, useUserData } from "../../../user-context";
import { Switch } from "../../../ui/atoms/switch";
import { useEffect, useState } from "react";
import { getStripePlans } from "../../common/api";
import { useOnlineStatus } from "../../../hooks";
import { useGleanClick } from "../../../telemetry/glean-context";
import { OFFER_OVERVIEW_CLICK } from "../../../telemetry/constants";
import SignInLink from "../../../ui/atoms/signin-link";

export enum Period {
  Month,
  Year,
}

const SUBSCRIPTIONS = {
  [SubscriptionType.MDN_CORE]: { order: 0, period: Period.Month },
  [SubscriptionType.MDN_PLUS_5M]: {
    order: 1,
    period: Period.Month,
  },
  [SubscriptionType.MDN_PLUS_5Y]: {
    order: 2,
    period: Period.Year,
  },
  [SubscriptionType.MDN_PLUS_10M]: {
    order: 3,
    period: Period.Month,
  },
  [SubscriptionType.MDN_PLUS_10Y]: {
    order: 4,
    period: Period.Year,
  },
};

export type OfferDetailsPlanProps = {
  subscriptionType: SubscriptionType;
  monthlyPrice?: number;
  ctaLink: string;
};

export type PlanInfo = {
  id: string;
  monthlyPriceInCents: number;
};

export type StripePlans = {
  currency: string;
  plans: { [key: string]: PlanInfo };
};

export type OfferDetailsProps = {
  id: string;
  name: string;
  price?: number;
  currency?: string;
  features: (string | null)[][];
  includes: string;
  cta: string;
  upgradeCta?: string;
  discounted: OfferDetailsPlanProps;
  regular: OfferDetailsPlanProps;
};

const PLUS_FEATURES = [
  ["ai-help", "AI Help", "beta"],
  ["updates", "Filter and sort updates"],
  ["collections", "Collections of articles"],
  ["offline", "MDN Offline"],
  ["afree", "Ads free", "new"],
];

const CORE: OfferDetailsProps = {
  id: "core",
  name: "Core",
  features: [
    ["ai-help", "AI Help (5 questions/24h)", "beta"],
    ["updates", "Filter and sort updates"],
    ["collections", "Up to 3 collections"],
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

function OfferDetails({
  offerDetails,
  period,
}: {
  offerDetails: OfferDetailsProps;
  period: Period;
}) {
  const discounted = period === Period.Year;
  const { subscriptionType, ctaLink, monthlyPrice } =
    period === Period.Year && offerDetails.id !== "core"
      ? offerDetails.discounted
      : offerDetails.regular;
  const userData = useUserData();
  const current = isCurrent(userData, subscriptionType);
  const upgrade = canUpgrade(userData, subscriptionType);
  const gleanClick = useGleanClick();
  const displayMonthlyPrice =
    monthlyPrice &&
    new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: offerDetails.currency,
    }).format(monthlyPrice / 100);
  return (
    <section className="subscribe-detail" id={offerDetails.id}>
      <h3>{offerDetails.name}</h3>
      <div className="sub-info">
        {(displayMonthlyPrice && (
          <p className="price">
            <span className="sub-price">{displayMonthlyPrice}</span>
            <span className="sub-length">
              /month
              <br />
              <i className="billed">
                {`Billed ${discounted ? "annually" : "monthly"}`}
              </i>
            </span>
          </p>
        )) || (
          <p className="price">
            <span className="sub-price free">Free</span>
          </p>
        )}
        {(current && <span className="sub-link current">Current plan</span>) ||
          (upgrade === null && (
            <a
              href={ctaLink}
              className="sub-link"
              onClick={() =>
                gleanClick(`${OFFER_OVERVIEW_CLICK}: ${offerDetails.id}`)
              }
            >
              {offerDetails.cta}
            </a>
          )) ||
          (upgrade && (
            <a href={ctaLink} className="sub-link">
              {offerDetails.upgradeCta}
            </a>
          )) || (
            <a
              href="/en-US/plus/docs/faq#can-i-upgrade/downgrade-my-plan-"
              className="sub-link na"
            >
              Not available
            </a>
          )}
        <p className="includes">{offerDetails.includes}</p>
        <ul>
          {offerDetails.features.map(([href, text, sup], index) => (
            <li key={index}>
              {(href && (
                <>
                  {" "}
                  <a href={`#${href}`}>{text}</a>
                  {sup && <sup className="new">{sup}</sup>}
                </>
              )) || (
                <>
                  {text}
                  {sup && <sup className="new">{sup}</sup>}
                </>
              )}
            </li>
          ))}
        </ul>
        <a
          href="https://www.mozilla.org/en-US/about/legal/terms/mdn-plus/"
          target="_blank"
          rel="noreferrer noopener"
          className="terms external"
        >
          See terms and conditions
        </a>
      </div>
    </section>
  );
}

function isCurrent(user: UserData, subscriptionType: SubscriptionType) {
  if (!user?.isAuthenticated) {
    return false;
  }
  return user.subscriptionType === subscriptionType;
}

function canUpgrade(user: UserData, subscriptionType: SubscriptionType) {
  if (!user?.isAuthenticated) {
    return null;
  }
  if (!user.isSubscriber || !user.subscriptionType) {
    return true;
  }
  return (
    SUBSCRIPTIONS[user.subscriptionType]?.order <
    SUBSCRIPTIONS[subscriptionType]?.order
  );
}

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

function OfferOverviewSubscribe() {
  const userData = useUserData();
  const [offerDetails, setOfferDetails] = useState<null | {
    CORE: OfferDetailsProps;
    PLUS_5: OfferDetailsProps | null;
    PLUS_10: OfferDetailsProps | null;
  }>(null);
  const { isOnline } = useOnlineStatus();

  useEffect(() => {
    (async () => {
      if (isOnline) {
        try {
          const plans: StripePlans = await getStripePlans();
          setOfferDetails(getLocalizedPlans(plans));
        } catch (error) {
          //Paid subs Not supported by region just display Free subscription
          setOfferDetails({ CORE: CORE, PLUS_5: null, PLUS_10: null });
        }
      }
    })();
  }, [isOnline]);

  const activeSubscription = userData?.subscriptionType;
  const activeSubscriptionPeriod =
    (activeSubscription && SUBSCRIPTIONS[activeSubscription]?.period) ||
    Period.Month;

  let [period, setPeriod] = useState(activeSubscriptionPeriod);
  const wrapperClass = !isOnline ? "wrapper-offline" : "wrapper";

  return (
    <div className="dark plus-subscribe-wrapper">
      <section className="container subscribe" id="subscribe">
        {!isOnline && (
          <h2>
            You are currently offline. Please go online to view the plans for
            MDN Plus
          </h2>
        )}
        {isOnline && (
          <>
            {(offerDetails && (
              <h2>
                Choose a plan
                {!activeSubscription && (
                  <>
                    {" "}
                    or <SignInLink cta="log in" />
                  </>
                )}
              </h2>
            )) || <h2>Loading available plans…</h2>}
            {offerDetails &&
              /** Only display discount switch if paid plans available  */
              offerDetails.PLUS_5 && (
                <Switch
                  name="period"
                  checked={period === Period.Year || false}
                  toggle={(e) => {
                    const period = e.target.checked
                      ? Period.Year
                      : Period.Month;
                    setPeriod(period);
                  }}
                >
                  Pay yearly and get 2 months for free
                </Switch>
              )}
          </>
        )}
        {offerDetails && (
          <div className={wrapperClass}>
            <OfferDetails
              offerDetails={offerDetails.CORE}
              period={period}
            ></OfferDetails>
            {offerDetails.PLUS_5 && (
              <OfferDetails
                offerDetails={offerDetails.PLUS_5}
                period={period}
              ></OfferDetails>
            )}
            {offerDetails.PLUS_10 && (
              <OfferDetails
                offerDetails={offerDetails.PLUS_10}
                period={period}
              ></OfferDetails>
            )}
          </div>
        )}
      </section>
      <p className="plus-for-companies">
        * Do you need MDN Plus for your company?{" "}
        <a href="https://docs.google.com/forms/d/15YimonAiA9ca-JrGfxgRstYEuQsVUuyzGH1_0RbpSPU/viewform">
          Let us know
        </a>{" "}
        and we’ll get back to you when it becomes available.
      </p>
    </div>
  );
}

export default OfferOverviewSubscribe;
