import * as React from "react";
import { useLocation } from "react-router";

import { useUserData } from "../user-context";
import { ENABLE_PLUS } from "../constants";

// We may or may not load any active banner. But if there's a small chance
// that we might, it's best practice to not have to lazy-load the CSS
// because lazy loading the CSS will put itself as blocking on the critical
// rendering. So, basically, if there's a >0% chance that we might load
// <ActiveBanner>, at least the CSS will be ready.
import "./banner.scss";

// import { COMMON_SURVEY_ID } from "./ids";
import { PLUS_IDv1 } from "./ids";

const ActiveBanner = React.lazy(() => import("./active-banner"));

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
    // If localStorage is not supported, then embargoes are not supported.
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

function isPathnameIncluded(id: string, pathname: string) {
  if (id === PLUS_IDv1) {
    return !(
      pathname.includes("/plus") ||
      pathname.includes("/signin") ||
      pathname.includes("/signup")
    );
  }
  return false;
}

function isGeoLocationIncluded(id: string, country: string) {
  if (id === PLUS_IDv1) {
    return country === "United States";
  }
  return false;
}

function isRandomlyIncluded(id: string, chancePercentage: number) {
  try {
    const key = `banner.${id}.chance`;
    const previous = localStorage.getItem(key);
    if (previous) {
      // The dice has been thrown before
      return JSON.parse(previous);
    }
    const include = Math.random() < chancePercentage / 100;
    localStorage.setItem(key, JSON.stringify(include));
    return include;
  } catch (error) {
    // If localStorage isn't working, always bail negatively.
  }
  return false;
}

export function Banner() {
  const userData = useUserData();
  const location = useLocation();

  // Never return true if the whoami hasn't resolved yet, anonymous or not.
  if (!userData) {
    return null;
  }

  // The order of the if statements is important and it's our source of
  // truth about which banner is "more important" than the other.

  // The PLUS_IDv(N) banner depends on the following logic:
  // 0. Is the banner not disabled by an environment variable
  // 1. Are you not on the MDN++ page or sign in/up already.
  // 2. Are you in the United States
  // 3. Are you part of the 10% who are randomly selected
  // 4. Have you not dismissed it previously
  // 5. Have you seen a different PLUS_IDvN banner before
  // 6. Is your locale en-US?
  if (
    ENABLE_PLUS &&
    isPathnameIncluded(PLUS_IDv1, location.pathname) &&
    isGeoLocationIncluded(PLUS_IDv1, userData.geo.country) &&
    isRandomlyIncluded(PLUS_IDv1, 10) &&
    !isEmbargoed(PLUS_IDv1)
  ) {
    return (
      <React.Suspense fallback={null}>
        <ActiveBanner
          id={PLUS_IDv1}
          onDismissed={() => {
            setEmbargoed(PLUS_IDv1, 7);
          }}
        />
      </React.Suspense>
    );
  }

  // THIS CODE IS LEFT COMMENTED-OUT UNTIL WE'RE CERTAIN WE'RE NOT GOING TO USE THIS.
  // IT'S KEPT AS REMINDER HOW TO IMPLEMENT THESE.
  // const isEnabled = (id: string) =>
  //   !isEmbargoed(id);

  // if (isEnabled(COMMON_SURVEY_ID)) {
  //   return (
  //     <Suspense fallback={null}>
  //       <ActiveBanner
  //         id={COMMON_SURVEY_ID}
  //         onDismissed={() => {
  //           setEmbargoed(COMMON_SURVEY_ID, 5);
  //         }}
  //       />
  //     </Suspense>
  //   );
  // }
  return null;
}
