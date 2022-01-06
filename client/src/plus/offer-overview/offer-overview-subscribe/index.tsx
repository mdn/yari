import "./index.scss";
import {
  FXA_SIGNIN_URL,
  MDN_PLUS_SUBSCRIBE_10M_URL,
  MDN_PLUS_SUBSCRIBE_10Y_URL,
  MDN_PLUS_SUBSCRIBE_50M_URL,
  MDN_PLUS_SUBSCRIBE_50Y_URL,
  MDN_PLUS_SUBSCRIBE_5M_URL,
  MDN_PLUS_SUBSCRIBE_5Y_URL,
} from "../../../constants";
import { UserData, useUserData } from "../../../user-context";
import { Switch } from "../../../ui/atoms/switch";
import { useState } from "react";

export enum Period {
  Month,
  Year,
}

export type OfferDetailsProps = {
  id: string;
  name: string;
  monthlyPrice?: number;
  discountedMonthlyPrice?: number;
  price?: number;
  currency?: string;
  period?: Period;
  features: (string | null)[][];
  includes: string;
  cta: string;
  ctaLink: string;
  discountedCtaLink?: string;
};

const PLUS_FEATURES = [
  ["bookmarking", "Bookmarking"],
  ["notifications", "Notifications"],
  ["offline", "MDN Offline"],
  ["themes", "Access to all themes"],
];

const CORE = {
  id: "core",
  name: "Core",
  features: [
    ["bookmarking", "5 Collections"],
    ["notifications", "3 Notifications"],
    ["offline", "Access to MDN Apps"],
    ["themes", "Dark mode"],
  ],
  includes: "Includes:",
  cta: "Start with Core",
  ctaLink: FXA_SIGNIN_URL,
};

const PLUS_5 = {
  id: "plus5",
  name: "MDN Plus 5",
  monthlyPrice: 500,
  discountedMonthlyPrice: 400,
  currency: "USD",
  features: PLUS_FEATURES,
  includes: "Includes unlimited access to:",
  cta: "Start with Supporter 5",
  ctaLink: MDN_PLUS_SUBSCRIBE_5M_URL,
  discountedCtaLink: MDN_PLUS_SUBSCRIBE_5Y_URL,
};

const PLUS_10 = {
  id: "plus10",
  name: "MDN Plus 10",
  monthlyPrice: 1000,
  discountedMonthlyPrice: 800,
  currency: "USD",
  features: [...PLUS_FEATURES, [null, "A good feeling"]],
  includes: "Includes unlimited access to:",
  cta: "Start with Supporter 10",
  ctaLink: MDN_PLUS_SUBSCRIBE_10M_URL,
  discountedCtaLink: MDN_PLUS_SUBSCRIBE_10Y_URL,
};

const PLUS_50 = {
  id: "plus50",
  name: "MDN Plus 50",
  monthlyPrice: 5000,
  discountedMonthlyPrice: 4000,
  currency: "USD",
  features: [...PLUS_FEATURES, [null, "A good feeling"]],
  includes: "Includes unlimited access to:",
  cta: "Start with Supporter 50",
  ctaLink: MDN_PLUS_SUBSCRIBE_50M_URL,
  discountedCtaLink: MDN_PLUS_SUBSCRIBE_50Y_URL,
};

function OfferDetails(props: OfferDetailsProps) {
  const discounted = props.period === Period.Year;
  const userData = useUserData();
  const current = isCurrent(userData, props.id);
  const displayMonthlyPrice =
    props.monthlyPrice &&
    props.discountedMonthlyPrice &&
    new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: props.currency,
    }).format(
      (discounted ? props.discountedMonthlyPrice : props.monthlyPrice) / 100
    );
  return (
    <section className="subscribe-detail" id={props.id}>
      <p className="sub-info">
        <h3>{props.name}</h3>
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
          <a
            href={discounted ? props.discountedCtaLink : props.ctaLink}
            className="sub-link"
          >
            {props.cta}
          </a>
        )}
        <p className="includes">{props.includes}</p>
        <ul>
          {props.features.map(([href, text]) => (
            <li>{(href && <a href={`#${href}`}>{text}</a>) || text}</li>
          ))}
        </ul>
        <span className="terms">See terms and conditions</span>
      </p>
    </section>
  );
}

// TODO: This depends on SubPlat providing us with the actual data.
function isCurrent(user: UserData | null, plan: String) {
  if (user === null || !user.isAuthenticated) {
    return false;
  }
  if (!user.isSubscriber && plan === "core") {
    return true;
  }
  if (user.isSubscriber && plan !== "core") {
    return true;
  }
  return false;
}

function OfferOverviewSubscribe() {
  let [period, setPeriod] = useState(Period.Month);
  return (
    <div className="subscribe" id="subscribe">
      <h2>Choose a plan</h2>
      <Switch
        name="period"
        checked={period === Period.Year || false}
        toggle={(e) => {
          setPeriod(e.target.checked ? Period.Year : Period.Month);
        }}
      >
        Save 20%
      </Switch>
      <div className="wrapper">
        <OfferDetails {...CORE} period={period}></OfferDetails>
        <OfferDetails {...PLUS_5} period={period}></OfferDetails>
        <OfferDetails {...PLUS_10} period={period}></OfferDetails>
        <OfferDetails {...PLUS_50} period={period}></OfferDetails>
      </div>
    </div>
  );
}

export default OfferOverviewSubscribe;
