export const STRIPE_PLANS_PATH = "/api/v1/stripe/plans";
export const SETTINGS_BASE_PATH = "/api/v1/plus/settings/";
export const NEWSLETTER_BASE_PATH = "/api/v1/plus/newsletter/";
export const EXPRERIMENTS_BASE_PATH = "/api/v1/plus/settings/experiments/";

export type PLUS_SETTINGS = {
  col_in_search: boolean;
};

export interface ExperimentsConfig {
  gpt4?: boolean | null;
  full_doc?: boolean | null;
  new_prompt?: boolean | null;
  history?: boolean | null;
}

export interface ExperimentsRequest {
  active?: boolean | null;
  config?: ExperimentsConfig | null;
}

export async function getExperiments(): Promise<ExperimentsRequest> {
  try {
    const res = await fetch(EXPRERIMENTS_BASE_PATH, {});
    const json: ExperimentsRequest = (await res.json()) || { active: false };
    return json;
  } catch {
    return { active: false, config: null };
  }
}

export async function setExperiments(
  req: ExperimentsRequest
): Promise<ExperimentsRequest> {
  try {
    const res = await fetch(EXPRERIMENTS_BASE_PATH, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(req),
    });
    const json: ExperimentsRequest = (await res.json()) || { active: false };
    return json;
  } catch {
    return { active: false, config: null };
  }
}

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

export async function toggleAIHelpHistory(enabled: boolean) {
  return await fetch(SETTINGS_BASE_PATH, {
    body: JSON.stringify({ no_ai_help_history: !enabled }),
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

export async function getStripePlans() {
  const res = await fetch(STRIPE_PLANS_PATH);

  return await res.json();
}
