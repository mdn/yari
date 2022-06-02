import * as React from "react";

import { setEmbargoed, isEmbargoed } from "./banner-utils";
import { CRUD_MODE } from "../env";

// We may or may not load any active banner. But if there's a small chance
// that we might, it's best practice to not have to lazy-load the CSS
// because lazy loading the CSS will put itself as blocking on the critical
// rendering. So, basically, if there's a >0% chance that we might load
// <ActiveBanner>, at least the CSS will be ready.
import "./banner.scss";

import { BannerId } from "./ids";

const ActiveBanner = React.lazy(() => import("./active-banner"));

const currentBannerId: BannerId | null = null;
const daysToEmbargo = 7;

export const hasActiveBanners = currentBannerId !== null;

export function Banner() {
  if (currentBannerId && (CRUD_MODE || !isEmbargoed(currentBannerId))) {
    return (
      <React.Suspense fallback={null}>
        <ActiveBanner
          id={currentBannerId}
          onDismissed={() => {
            setEmbargoed(currentBannerId, daysToEmbargo);
          }}
        />
      </React.Suspense>
    );
  }

  return null;
}
