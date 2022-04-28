import "./index.scss";
import { SubscriptionType, UserData, useUserData } from "../../../user-context";
import { Switch } from "../../../ui/atoms/switch";
import { useState } from "react";
import { useOnlineStatus } from "../../../hooks";

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
          {offerDetails.features.map(([href, text], index) => (
            <li key={index}>
              {(href && <a href={`#${href}`}>{text}</a>) || text}
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

function OfferOverviewSubscribe({
  offerDetails,
}: {
  offerDetails: {
    CORE: OfferDetailsProps;
    PLUS_5: OfferDetailsProps | null;
    PLUS_10: OfferDetailsProps | null;
  } | null;
}) {
  const userData = useUserData();

  const { isOnline } = useOnlineStatus();

  const activeSubscription = userData?.subscriptionType;
  const activeSubscriptionPeriod =
    (activeSubscription && SUBSCRIPTIONS[activeSubscription]?.period) ||
    Period.Month;

  let [period, setPeriod] = useState(activeSubscriptionPeriod);
  const wrapperClass = !isOnline ? "wrapper-offline" : "wrapper";

  return (
    <div className="dark subscribe-wrapper">
      <section className="container subscribe" id="subscribe">
        {!isOnline && (
          <h2>
            You are currently offline. Please go online to view the plans for
            MDN Plus
          </h2>
        )}
        {isOnline && (
          <>
            {(offerDetails && <h2>Choose a plan</h2>) || (
              <h2>Loading available plans…</h2>
            )}
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
