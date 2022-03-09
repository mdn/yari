import * as React from "react";

import { ReactComponent as CloseIcon } from "@mdn/dinocons/general/close.svg";
import { useGA } from "../ga-context";
import { REDESIGN_ANNOUNCEMENT } from "./ids";

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

function sendCTAEventToGA(eventCategory: string) {
  const ga = useGA();
  ga("send", {
    hitType: "event",
    eventCategory: eventCategory,
    eventAction: "CTA clicked",
    eventLabel: "banner",
  });
}

function RedesignAnnouncementBanner({
  onDismissed,
}: {
  onDismissed: () => void;
}) {
  return (
    <Banner id={REDESIGN_ANNOUNCEMENT} onDismissed={onDismissed}>
      <p className="mdn-cta-copy">
        ✨{" "}
        <a
          href="https://hacks.mozilla.org/2022/02/a-new-year-a-new-mdn/"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => sendCTAEventToGA(REDESIGN_ANNOUNCEMENT)}
        >
          Learn more
        </a>{" "}
        about MDN Web Docs' new design.
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
  id: string;
  onDismissed: () => void;
}) {
  if (id === REDESIGN_ANNOUNCEMENT) {
    return <RedesignAnnouncementBanner onDismissed={onDismissed} />;
  }
  throw new Error(`Unrecognized banner to display (${id})`);
}
