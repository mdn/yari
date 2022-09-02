// Set a localStorage key with a timestamp the specified number of
// days into the future. When the user dismisses a banner we use this

import { BannerId } from "./ids";

// to prevent the redisplay of the banner for a while.
export function setEmbargoed(id: BannerId, days: number) {
  try {
    const key = `banner.${id}.embargoed_until`;
    localStorage.setItem(
      key,
      String(Date.now() + Math.round(days * 24 * 60 * 60 * 1000))
    );
  } catch (e) {
    console.warn("Unable to write banner embargo to localStorage", e);
  }
}

// See whether the specified id was passed to setEmbargoed() fewer than the
// specified number of days ago. We check this before displaying a banner
// so a user does not see a banner they recently dismissed.
export function isEmbargoed(id: BannerId) {
  try {
    const key = `banner.${id}.embargoed_until`;
    const value = localStorage.getItem(key);
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
    console.warn("Unable to read banner embargo from localStorage", e);

    return false;
  }
}
