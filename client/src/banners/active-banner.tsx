import * as React from "react";

import { ReactComponent as CloseIcon } from "@mdn/dinocons/general/close.svg";
import { useGA } from "../ga-context";
import { BannerId } from "./ids";
import { useGleanClick } from "../telemetry/glean-context";
import {
  BANNER_MULTIPLE_COLLECTIONS_DISMISSED,
  BANNER_MULTIPLE_COLLECTIONS_LINK,
  BANNER_NEWSLETTER_DISMISSED,
  BANNER_NEWSLETTER_LINK,
  BANNER_PREVIEW_FEATURES_DISMISSED,
  BANNER_PREVIEW_FEATURES_SETTINGS_LINK,
} from "../telemetry/constants";

// The <Banner> component displays a simple call-to-action banner at
// the bottom of the window. The following props allow it to be customized.
//
// TODO: we should probably make the image and maybe the background of
// the banner configurable through props like these. For now, however,
// that is hardcoded into the stylesheet.
export type BannerProps = {
  // A unique string associated with this banner. Is also
  // used as part of a localStorage key.
  id: string;
  // class name used on main banner container. Exclusively used
  // for styling purposes.
  classname?: string;
  // The banner title. e.g. "MDN Survey"
  title?: string;
  // The banner description. e.g. "Help us understand the top 10 needs..."
  // Could also be a React Element such as that returned by `<Interpolated />`
  onCTAClick?: (event: React.SyntheticEvent<HTMLAnchorElement>) => any;
  onDismissed: () => void;
  children: React.ReactNode;
};

function Banner(props: BannerProps) {
  const [isDismissed, setDismissed] = React.useState(false);
  const containerClassNames = props.classname
    ? `mdn-cta-container ${props.classname}`
    : "mdn-cta-container";

  if (isDismissed) {
    return null;
  }

  return (
    <div className={containerClassNames}>
      <div id="mdn-cta-content" className="mdn-cta-content">
        <div id={props.id} className="mdn-cta-content-container">
          {props.children}
        </div>
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
          <CloseIcon />
        </button>
      </div>
    </div>
  );
}

function useSendCTAEventToGA() {
  const ga = useGA();

  return (eventCategory: string) => {
    ga("send", {
      hitType: "event",
      eventCategory: eventCategory,
      eventAction: "CTA clicked",
      eventLabel: "banner",
    });
  };
}

function PreviewFeaturesBanner({ onDismissed }: { onDismissed: () => void }) {
  const bannerId = BannerId.PREVIEW_FEATURES;
  const sendCTAEventToGA = useSendCTAEventToGA();
  const gleanClick = useGleanClick();
  const onDismissedWithGlean = () => {
    gleanClick(BANNER_PREVIEW_FEATURES_DISMISSED);
    onDismissed();
  };
  return (
    <Banner id={bannerId} onDismissed={onDismissedWithGlean}>
      <p className="mdn-cta-copy">
        MDN Plus preview features are now available.{" "}
        <a
          href="/en-US/plus/settings"
          onClick={() => {
            gleanClick(BANNER_PREVIEW_FEATURES_SETTINGS_LINK);
            sendCTAEventToGA(bannerId);
          }}
        >
          Manage settings
        </a>
      </p>
    </Banner>
  );
}

function MultipleCollectionsBanner({
  onDismissed,
}: {
  onDismissed: () => void;
}) {
  const bannerId = BannerId.PREVIEW_FEATURES;
  const sendCTAEventToGA = useSendCTAEventToGA();
  const gleanClick = useGleanClick();
  const onDismissedWithGlean = () => {
    gleanClick(BANNER_MULTIPLE_COLLECTIONS_DISMISSED);
    onDismissed();
  };
  return (
    <Banner id={bannerId} onDismissed={onDismissedWithGlean}>
      <p className="mdn-cta-copy">
        We've added support for Multiple Collections! Check out your{" "}
        <a
          href="/en-US/plus/collections"
          onClick={() => {
            gleanClick(BANNER_MULTIPLE_COLLECTIONS_LINK);
            sendCTAEventToGA(bannerId);
          }}
        >
          Collections page
        </a>{" "}
        to see what's new!
      </p>
    </Banner>
  );
}

function NewsletterBanner({ onDismissed }: { onDismissed: () => void }) {
  const bannerId = BannerId.NEWSLETTER_ANNOUNCEMENT;
  const sendCTAEventToGA = useSendCTAEventToGA();
  const gleanClick = useGleanClick();
  const onDismissedWithGlean = () => {
    gleanClick(BANNER_NEWSLETTER_DISMISSED);
    onDismissed();
  };
  return (
    <Banner id={bannerId} onDismissed={onDismissedWithGlean}>
      <p className="mdn-cta-copy">
        You can now sign up to the MDN Plus Newsletter via the{" "}
        <a
          href="/en-US/plus/settings"
          onClick={() => {
            gleanClick(BANNER_NEWSLETTER_LINK);
            sendCTAEventToGA(bannerId);
          }}
        >
          Settings Page
        </a>
        .
      </p>
    </Banner>
  );
}

// The reason we're not just exporting each individual banner is because to
// be able to lazy-load the contents of this file it needs to export a
// default function. This one function is the link between the <App>
// and all the individual banner components.
export default function ActiveBanner({
  id,
  onDismissed,
}: {
  id: BannerId;
  onDismissed: () => void;
}) {
  switch (id) {
    case BannerId.MULTIPLE_COLLECTIONS:
      return (
        <>
          <MultipleCollectionsBanner onDismissed={onDismissed} />
        </>
      );

    case BannerId.PREVIEW_FEATURES:
      return (
        <>
          <PreviewFeaturesBanner onDismissed={onDismissed} />
        </>
      );

    case BannerId.NEWSLETTER_ANNOUNCEMENT:
      return (
        <>
          <NewsletterBanner onDismissed={onDismissed} />
        </>
      );

    default:
      throw new Error(`Unrecognized banner to display (${id})`);
  }
}
