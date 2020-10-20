import React, { useEffect, useState } from "react";

import CloseIcon from "../kumastyles/general/close.svg";
import { CATEGORY_MONTHLY_PAYMENTS, useGA } from "../ga-context";
import { useLocale } from "../hooks";
import { DEVELOPER_NEEDS_ID, SUBSCRIPTION_ID } from "./ids";

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
  // An optional property. If present, it should be set to true to indicate
  // that the main cta link should open in a new window
  newWindow?: boolean;
  // an optional property. If present, it will be called when the CTA
  // link is clicked
  onCTAClick?: (event: React.SyntheticEvent<HTMLAnchorElement>) => any;
  onDismissed: () => void;
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
            props.onDismissed();
          }}
        >
          <img src={CloseIcon} alt="close" className="icon icon-close" />
        </button>
      </div>
    </div>
  );
}

function DeveloperNeedsBanner({ onDismissed }: { onDismissed: () => void }) {
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
      onDismissed={onDismissed}
    />
  );
}

function SubscriptionBanner({ onDismissed }: { onDismissed: () => void }) {
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
      onDismissed={onDismissed}
    />
  );
}

// The reason we're not just exporting each individual banner is because to
// be able to lazy-load the contents of this file it needs to export a
// default function. This this one function is the link between the <App>
// and all the individual banner components.
export default function ActiveBanner({
  id,
  onDismissed,
}: {
  id: string;
  onDismissed: () => void;
}) {
  if (id === DEVELOPER_NEEDS_ID) {
    return <DeveloperNeedsBanner onDismissed={onDismissed} />;
  } else if (id === SUBSCRIPTION_ID) {
    return <SubscriptionBanner onDismissed={onDismissed} />;
  }
  throw new Error(`Unrecognized banner to display (${id})`);
}
