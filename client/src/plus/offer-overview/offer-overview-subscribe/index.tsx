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

const BILLING_PERIOD = "subscription_billing_period";

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
  discounted: OfferDetailsPlanProps;
  regular: OfferDetailsPlanProps;
};

const PLUS_FEATURES = [
  ["notifications", "Page notifications"],
  ["collections", "Manual and automatic saved articles"],
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
  cta: "Start with Supporter 5",
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
  name: "MDN Plus 10",
  currency: "USD",
  features: [
    ...PLUS_FEATURES,
    [null, "Early access to new features"],
    [null, "Pride and joy"],
  ],
  includes: "Includes unlimited access to:",
  cta: "Start with Supporter 10",
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
        {(current && (
          <span className="sub-link current">Current plan</span>
        )) || (
          <a href={ctaLink} className="sub-link">
            {offerDetails.cta}
          </a>
        )}
        <p className="includes">{offerDetails.includes}</p>
        <ul>
          {offerDetails.features.map(([href, text]) => (
            <li>{(href && <a href={`#${href}`}>{text}</a>) || text}</li>
          ))}
        </ul>
        <span className="terms">See terms and conditions</span>
      </p>
    </section>
  );
}

// TODO: This depends on SubPlat providing us with the actual data.
function isCurrent(user: UserData | null, subscriptionType: SubscriptionType) {
  if (user === null || !user.isAuthenticated) {
    return false;
  }
  return user.subscriptionType === subscriptionType;
}

function OfferOverviewSubscribe() {
  const isServer = typeof window === "undefined";

  const initialPeriod =
    JSON.parse((!isServer && localStorage.getItem(BILLING_PERIOD)) || "null") ||
    Period.Month;
  let [period, setPeriod] = useState(initialPeriod);

  return (
    <div className="dark subscribe-wrapper">
      <section className="container subscribe" id="subscribe">
        <h2>Choose a plan</h2>
        <Switch
          name="period"
          checked={period === Period.Year || false}
          toggle={(e) => {
            const period = e.target.checked ? Period.Year : Period.Month;
            !isServer &&
              localStorage.setItem(BILLING_PERIOD, JSON.stringify(period));
            setPeriod(period);
          }}
        >
          Pay yearly and get 2 month for free
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
