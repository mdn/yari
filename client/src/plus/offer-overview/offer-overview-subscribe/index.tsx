import "./index.scss";
import {
  MDN_PLUS_SUBSCRIBE_MONTHLY_URL,
  MDN_PLUS_SUBSCRIBE_YEARLY_URL,
} from "../../../constants";

export enum Period {
  Month,
  Year,
}

export type OfferDetailsProps = {
  id: string;
  tagline?: string;
  name: string;
  monthlyPrice: number;
  price: number;
  currency: string;
  period: Period;
  features: string[][];
  cta: string;
  ctaLink: string;
};

const YEARLY = {
  id: "annually",
  tagline: "Save 20%",
  name: "Yearly",
  monthlyPrice: 5000 / 12,
  price: 5000,
  currency: "USD",
  period: Period.Year,
  features: [
    ["bookmarking", "Bookmarking"],
    ["notifications", "Notifications"],
    ["offline", "MDN Offline"],
    ["themes", "Access to all themes"],
  ],
  cta: "Get yearly Plan",
  ctaLink: MDN_PLUS_SUBSCRIBE_YEARLY_URL,
};

const MONTHLY = {
  id: "monthly",
  name: "Monthly",
  monthlyPrice: 500,
  price: 5000 * 12,
  currency: "USD",
  period: Period.Month,
  features: [
    ["bookmarking", "Bookmarking"],
    ["notifications", "Notifications"],
    ["offline", "MDN Offline"],
    ["themes", "Access to all themes"],
  ],
  cta: "Get monthly Plan",
  ctaLink: MDN_PLUS_SUBSCRIBE_MONTHLY_URL,
};

function OfferDetails(props: OfferDetailsProps) {
  const displayMonthlyPrice = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: props.currency,
  }).format(props.monthlyPrice / 100);
  const displayPrice = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: props.currency,
  }).format(props.price / 100);
  return (
    <section className="subscribe-detail" id={props.id}>
      {props.tagline && <p className="tagline">{props.tagline}</p>}
      <p className="sub-info">
        <h3>Yearly</h3>
        <p>
          <span className="sub-price">{displayMonthlyPrice}</span>
          <span className="sub-length">/month</span>
        </p>
        <p>
          <i>
            {props.period === Period.Month
              ? "Billed monthly"
              : `${displayPrice} billed annually`}
          </i>
        </p>
        <ul>
          {props.features.map(([href, text]) => (
            <li>
              <a href={`#${href}`}>{text}</a>
            </li>
          ))}
        </ul>
        <a href={props.ctaLink} className="sub-link">
          {props.cta}
        </a>
        <span className="terms">See terms and conditions</span>
      </p>
    </section>
  );
}

function OfferOverviewSubscribe() {
  return (
    <div className="subscribe" id="subscribe">
      <h2>Choose a plan</h2>
      <div className="wrapper">
        <OfferDetails {...YEARLY}></OfferDetails>
        <OfferDetails {...MONTHLY}></OfferDetails>
      </div>
    </div>
  );
}

export default OfferOverviewSubscribe;
