import React, { useEffect, useState } from "react";

import CloseIcon from "../kumastyles/general/close.svg";
import { CATEGORY_MONTHLY_PAYMENTS, useGA } from "../ga-context";
import { useLocale } from "../hooks";
import { useUserData } from "../user-context";

// TODO: split up banners into separate lazy-loaded component files
import "../kumastyles/components/banners/base.scss";
import "../kumastyles/components/banners/developer-needs.scss";
import "../kumastyles/components/banners/l10n-survey.scss";
import "../kumastyles/components/banners/mdn-subscriptions.scss";

// Set a localStorage key with a timestamp the specified number of
// days into the future. When the user dismisses a banner we use this
// to prevent the redisplay of the banner for a while.
function setEmbargoed(id, days) {
  try {
    let key = `banner.${id}.embargoed_until`;
    localStorage.setItem(
      key,
      String(Date.now() + Math.round(days * 24 * 60 * 60 * 1000))
    );
  } catch (e) {
    // If localStorage is not supported, then embargos are not supported.
  }
}

// See whether the specified id was passed to setEmbargoed() fewer than the
// specified number of days ago. We check this before displaying a banner
// so a user does not see a banner they recently dismissed.
function isEmbargoed(id) {
  try {
    let key = `banner.${id}.embargoed_until`;
    let value = localStorage.getItem(key);
    // If it is not set, then the banner has never been dismissed
    if (!value) {
      return false;
    }
    // The value from localStorage is a timestamp that we compare to
    // the current time
    if (parseInt(value) > Date.now()) {
      // If the timestamp is in the future then the banner has been
      // dismissed and the embargo has not yet expired.
      return true;
    } else {
      // Otherwise, the banner was dismissed, but the embargo has
      // expired and we can show it again.
      localStorage.removeItem(key);
      return false;
    }
  } catch (e) {
    // If localStorage is not supported, then the embargo feature
    // just won't work
    return false;
  }
}

// The <Banner> component displays a simple call-to-action banner at
// the bottom of the window. The following props allow it to be customized.
//
// TODO: we should probably make the image and maybe the background of
// the banner configurable through props like these. For now, however,
// that is hardcoded into the stylesheet.
export type BannerProps = {
  // A unique string associated with this banner. It must match the
  // name of the waffle flag that controls the banner, and is also
  // used as part of a localStorage key.
  id: string;
  // class name used on main banner container. Exclusively used
  // for styling purposes.
  classname: string;
  // The banner title. e.g. "MDN Survey"
  title?: string;
  // The banner description. e.g. "Help us understand the top 10 needs..."
  // Could also be a React Element such as that returned by `<Interpolated />`
  copy: Object | string;
  // The call to action button text. e.g. "Take the survey"
  cta: string;
  // The URL of the page to open when the button is clicked
  url: string;
  // An optional property. If present, it specifies the number of days
  // for which a dismissed banner will not be shown. If omitted, the
  // default is 5 days.
  embargoDays?: number;
  // An optional property. If present, it should be set to true to indicate
  // that the main cta link should open in a new window
  newWindow?: boolean;
  // an optional property. If present, it will be called when the CTA
  // link is clicked
  onCTAClick?: (event: React.SyntheticEvent<HTMLAnchorElement>) => any;
};

function Banner(props: BannerProps) {
  const [isDismissed, setDismissed] = useState(false);
  const containerClassNames = `${props.classname} mdn-cta-container cta-background-linear`;

  if (isDismissed) {
    return null;
  }

  return (
    <div className={containerClassNames}>
      <div id="mdn-cta-content" className="mdn-cta-content">
        <div id={props.id} className="mdn-cta-content-container">
          {props.title && (
            <h2 className="mdn-cta-title slab-text">{props.title}</h2>
          )}
          <p className="mdn-cta-copy">{props.copy}</p>
        </div>
        <p className="mdn-cta-button-container">
          <a
            href={props.url}
            className="mdn-cta-button"
            target={props.newWindow ? "_blank" : undefined}
            rel={props.newWindow ? "noopener noreferrer" : undefined}
            onClick={props.onCTAClick}
          >
            {props.cta}
          </a>
        </p>
      </div>
      <div className="mdn-cta-controls">
        <button
          type="button"
          id="mdn-cta-close"
          className="mdn-cta-close"
          aria-label={"Close banner"}
          onClick={() => {
            setDismissed(true);
            setEmbargoed(props.id, props.embargoDays || 5);
          }}
        >
          <img src={CloseIcon} alt="close" className="icon icon-close" />
        </button>
      </div>
    </div>
  );
}

const DEVELOPER_NEEDS_ID = "developer_needs";
const SUBSCRIPTION_ID = "subscription_banner";

function DeveloperNeedsBanner() {
  return (
    <Banner
      id={DEVELOPER_NEEDS_ID}
      classname="developer-needs"
      title={"MDN Survey"}
      copy={
        "Help us understand the top 10 needs of Web developers and designers."
      }
      cta={"Take the survey"}
      url={"https://qsurvey.mozilla.com/s3/Developer-Needs-Assessment-2019"}
      newWindow
    />
  );
}

function SubscriptionBanner() {
  const ga = useGA();
  const locale = useLocale();

  useEffect(() => {
    ga("send", {
      hitType: "event",
      eventCategory: CATEGORY_MONTHLY_PAYMENTS,
      eventAction: "CTA shown",
      eventLabel: "banner",
    });
  }, [ga]);

  return (
    <Banner
      id={SUBSCRIPTION_ID}
      classname="mdn-subscriptions"
      title={"Become a monthly supporter"}
      copy={"Support MDN with a $5 monthly subscription"}
      cta={"Learn more"}
      url={`/${locale}/payments/`}
      embargoDays={7}
    />
  );
}

export function ActiveBanner() {
  const userData = useUserData();

  console.log("ActiveBanner", userData);

  if (!userData) {
    return null;
  }

  const isEnabled = (id: string) =>
    userData.waffle.flags[id] && !isEmbargoed(id);

  // The order of the if statements is important and it's our source of
  // truth about which banner is "more important" than the other.
  if (isEnabled(DEVELOPER_NEEDS_ID)) {
    return <DeveloperNeedsBanner />;
  } else if (isEnabled(SUBSCRIPTION_ID) && !userData.isSubscriber) {
    return <SubscriptionBanner />;
  }
  return null;
}
