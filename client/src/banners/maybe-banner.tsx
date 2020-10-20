import React, { Suspense, lazy } from "react";

import { useUserData } from "../user-context";

// We may or may not load any active banner. But if there's a small chance
// that we might, it's best practice to not have to lazy-load the CSS
// because lazy loading the CSS will put itself as blocking on the critical
// rendering. So, basically, if there's a >0% chance that we might load
// <ActiveBanner>, at least the CSS will be ready.
import "../kumastyles/components/banners/base.scss";
import "../kumastyles/components/banners/developer-needs.scss";
import "../kumastyles/components/banners/l10n-survey.scss";
import "../kumastyles/components/banners/mdn-subscriptions.scss";

import { DEVELOPER_NEEDS_ID, SUBSCRIPTION_ID } from "./ids";

const ActiveBanner = lazy(() => import("./active-banner"));

// Set a localStorage key with a timestamp the specified number of
// days into the future. When the user dismisses a banner we use this
// to prevent the redisplay of the banner for a while.
function setEmbargoed(id: string, days: number) {
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
function isEmbargoed(id: string) {
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

export function MaybeBanner() {
  const userData = useUserData();

  if (!userData) {
    return null;
  }

  const isEnabled = (id: string) =>
    (userData.waffle.flags[id] || userData.waffle.switches[id]) &&
    !isEmbargoed(id);

  if (isEnabled(DEVELOPER_NEEDS_ID)) {
    return (
      <Suspense fallback={null}>
        <ActiveBanner
          id={DEVELOPER_NEEDS_ID}
          onDismissed={() => {
            setEmbargoed(DEVELOPER_NEEDS_ID, 5);
          }}
        />
      </Suspense>
    );
  } else if (isEnabled(SUBSCRIPTION_ID) && !userData.isSubscriber) {
    return (
      <Suspense fallback={null}>
        <ActiveBanner
          id={SUBSCRIPTION_ID}
          onDismissed={() => {
            setEmbargoed(SUBSCRIPTION_ID, 7);
          }}
        />
      </Suspense>
    );
  }
  return null;
}
