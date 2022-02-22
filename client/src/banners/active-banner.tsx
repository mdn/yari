/* eslint-disable react/jsx-no-target-blank */
import * as React from "react";

import { ReactComponent as CloseIcon } from "@mdn/dinocons/general/close.svg";
import { useGA } from "../ga-context";
import { useUserData } from "../user-context";
import { PLUS_LAUNCH_ANNOUNCEMENT } from "./ids";
import { isPlusAvailable } from "../utils";
import { usePlusUrl } from "../plus/utils";
import { ENABLE_PLUS_EU } from "../constants";

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

function PlusLaunchAnnouncementBanner({
  onDismissed,
}: {
  onDismissed: () => void;
}) {
  const sendCTAEventToGA = useSendCTAEventToGA();
  const plusUrl = usePlusUrl();

  return (
    <Banner id={PLUS_LAUNCH_ANNOUNCEMENT} onDismissed={onDismissed}>
      {(ENABLE_PLUS_EU && (
        <p className="mdn-cta-copy">
          <a href={plusUrl} className="mdn-plus">
            MDN Plus
          </a>{" "}
          now available in <span className="underlined">your</span> country!
          Support MDN <span className="underlined">and</span> make it your own.{" "}
          <a
            href="https://hacks.mozilla.org/2022/04/mdn-plus-now-available-in-more-markets"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sendCTAEventToGA(PLUS_LAUNCH_ANNOUNCEMENT)}
          >
            Learn more
          </a>{" "}
          ✨
        </p>
      )) || (
        <p className="mdn-cta-copy">
          <a href={plusUrl} className="mdn-plus">
            MDN Plus
          </a>{" "}
          is here! Support MDN <em>and</em> make it your own.{" "}
          <a
            href="https://hacks.mozilla.org/2022/03/introducing-mdn-plus-make-mdn-your-own"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sendCTAEventToGA(PLUS_LAUNCH_ANNOUNCEMENT)}
          >
            Learn more
          </a>{" "}
          ✨
        </p>
      )}
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
  id: string;
  onDismissed: () => void;
}) {
  const userData = useUserData();

  if (id === PLUS_LAUNCH_ANNOUNCEMENT) {
    return (
      <>
        {isPlusAvailable(userData) && (
          <PlusLaunchAnnouncementBanner onDismissed={onDismissed} />
        )}
      </>
    );
  }
  throw new Error(`Unrecognized banner to display (${id})`);
}
