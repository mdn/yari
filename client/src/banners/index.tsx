import * as React from "react";

import { setEmbargoed, isEmbargoed } from "./banner-utils";
import { CRUD_MODE } from "../constants";

// We may or may not load any active banner. But if there's a small chance
// that we might, it's best practice to not have to lazy-load the CSS
// because lazy loading the CSS will put itself as blocking on the critical
// rendering. So, basically, if there's a >0% chance that we might load
// <ActiveBanner>, at least the CSS will be ready.
import "./banner.scss";

import { PLUS_LAUNCH_ANNOUNCEMENT } from "./ids";

const ActiveBanner = React.lazy(() => import("./active-banner"));

export const hasActiveBanners = true;

export function Banner() {
  if (CRUD_MODE || !isEmbargoed(PLUS_LAUNCH_ANNOUNCEMENT)) {
    return (
      <React.Suspense fallback={null}>
        <ActiveBanner
          id={PLUS_LAUNCH_ANNOUNCEMENT}
          onDismissed={() => {
            setEmbargoed(PLUS_LAUNCH_ANNOUNCEMENT, 7);
          }}
        />
      </React.Suspense>
    );
  }

  return null;
}
