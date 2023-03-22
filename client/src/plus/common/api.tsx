export const PLUS_PLANS_PATH = "/plus/plans.json";
export const SETTINGS_BASE_PATH = "/api/v1/plus/settings/";
export const NEWSLETTER_BASE_PATH = "/api/v1/plus/newsletter/";

export type PLUS_SETTINGS = {
  col_in_search: boolean;
};

export async function toggleNewsletterSubscription(
  subscribed: boolean
): Promise<boolean | null> {
  try {
    const res = await fetch(NEWSLETTER_BASE_PATH, {
      method: subscribed ? "POST" : "DELETE",
      headers: {
        "content-type": "application/json",
      },
    });
    const { subscribed: subscribedUpdated } = await res.json();
    return subscribedUpdated;
  } catch {
    return null;
  }
}

export async function toggleNoAds(enabled: boolean) {
  return await fetch(SETTINGS_BASE_PATH, {
    body: JSON.stringify({ no_ads: enabled }),
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
  });
}

export async function getNewsletterSubscription(): Promise<boolean | null> {
  try {
    const res = await fetch(NEWSLETTER_BASE_PATH);
    const { subscribed } = await res.json();
    return subscribed;
  } catch {
    return null;
  }
}

export async function getPlusPlans() {
  let res;
  //This comes from edge lambda so must be from live.
  if (window.location.hostname.includes("localhost")) {
    res = await fetch("https://developer.allizom.org/plus/plans.json");
  } else {
    res = await fetch(PLUS_PLANS_PATH);
  }

  return await res.json();
}
