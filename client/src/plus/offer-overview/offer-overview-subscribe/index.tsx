import "./index.scss";
import {
  FXA_SIGNIN_URL,
  MDN_PLUS_SUBSCRIBE_10M_URL,
  MDN_PLUS_SUBSCRIBE_10Y_URL,
  MDN_PLUS_SUBSCRIBE_5M_URL,
  MDN_PLUS_SUBSCRIBE_5Y_URL,
} from "../../../constants";
import { SubscriptionType, UserData, useUserData } from "../../../user-context";
import { Switch } from "../../../ui/atoms/switch";
import { useState } from "react";

export enum Period {
  Month,
  Year,
}

const SUBSCRIPTIONS = {
  [SubscriptionType.MDN_CORE]: { order: 0 },
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
  ["notifications", "Page notifications"],
  ["collections", "Collections of articles"],
  ["offline", "MDN offline"],
];

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
    ctaLink: FXA_SIGNIN_URL,
  },
  discounted: {
    subscriptionType: SubscriptionType.MDN_CORE,
    ctaLink: FXA_SIGNIN_URL,
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
  const displayMonthlyPrice =
    monthlyPrice &&
    new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: offerDetails.currency,
    }).format(monthlyPrice / 100);
  return (
    <section className="subscribe-detail" id={offerDetails.id}>
      <h3>{offerDetails.name}</h3>
      <p className="sub-info">
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
            <a href={ctaLink} className="sub-link">
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
          {offerDetails.features.map(([href, text]) => (
            <li>{(href && <a href={`#${href}`}>{text}</a>) || text}</li>
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
      </p>
    </section>
  );
}

function isCurrent(user: UserData | null, subscriptionType: SubscriptionType) {
  if (user === null || !user.isAuthenticated) {
    return false;
  }
  return user.subscriptionType === subscriptionType;
}

function canUpgrade(user: UserData | null, subscriptionType: SubscriptionType) {
  if (user === null || !user.isAuthenticated) {
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

function OfferOverviewSubscribe() {
  const userData = useUserData();
  const activeSubscription = userData?.subscriptionType;
  const activeSubscriptionPeriod =
    (activeSubscription && SUBSCRIPTIONS[activeSubscription]?.period) ||
    Period.Month;

  let [period, setPeriod] = useState(activeSubscriptionPeriod);

  return (
    <div className="dark subscribe-wrapper">
      <section className="container subscribe" id="subscribe">
        <h2>Choose a plan</h2>
        <Switch
          name="period"
          checked={period === Period.Year || false}
          toggle={(e) => {
            const period = e.target.checked ? Period.Year : Period.Month;
            setPeriod(period);
          }}
        >
          Pay yearly and get 2 months for free
        </Switch>
        <div className="wrapper">
          <OfferDetails offerDetails={CORE} period={period}></OfferDetails>
          <OfferDetails offerDetails={PLUS_5} period={period}></OfferDetails>
          <OfferDetails offerDetails={PLUS_10} period={period}></OfferDetails>
        </div>
      </section>
    </div>
  );
}

export default OfferOverviewSubscribe;
