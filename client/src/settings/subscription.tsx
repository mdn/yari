import { useCallback, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

export type SubscriptionConfig = {
  public_key: string;
  prices: {
    id: string;
    currency: string;
    unit_amount: number;
  }[];
};

async function redirectToStripeCheckout(
  config: SubscriptionConfig,
  csrfToken: string
) {
  const formData = new URLSearchParams();
  formData.set("priceId", config.prices[0].id);
  const [stripe, response] = await Promise.all([
    loadStripe(config.public_key),

    fetch("/api/v1/subscriptions/checkout/", {
      method: "POST",
      headers: {
        "X-CSRFToken": csrfToken,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    }),
  ]);
  if (response.ok) {
    const { sessionId } = await response.json();
    stripe!.redirectToCheckout({ sessionId });
  } else {
    throw new Error(await response.text());
  }
}

async function redirectToStripeCustomerPortal(csrfToken: string) {
  const response = await fetch("/api/v1/subscriptions/customer_portal/", {
    method: "POST",
    headers: {
      "X-CSRFToken": csrfToken,
    },
  });
  if (response.ok) {
    const { url } = await response.json();
    window.location.href = url;
  } else {
    throw new Error(await response.text());
  }
}

export function Subscription({
  config,
  csrfmiddlewaretoken,
  current,
}: {
  config: SubscriptionConfig;
  csrfmiddlewaretoken: string;
  current: object;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const checkout = useCallback(async () => {
    setIsLoading(true);
    try {
      await redirectToStripeCheckout(config, csrfmiddlewaretoken);
    } catch (error) {
      setError(error);
    }
  }, [config, csrfmiddlewaretoken]);

  const manage = useCallback(async () => {
    setIsLoading(true);
    try {
      await redirectToStripeCustomerPortal(csrfmiddlewaretoken);
    } catch (error) {
      setError(error);
    }
  }, [csrfmiddlewaretoken]);

  return (
    <div>
      <h3>Subscription</h3>
      {error && <div className="notecard negative">{error.toString()}</div>}
      {current ? (
        <>
          <button disabled={isLoading} onClick={() => manage()}>
            Manage
          </button>
          <pre>{JSON.stringify(current, null, 2)}</pre>
        </>
      ) : (
        <button disabled={isLoading} onClick={() => checkout()}>
          Create {JSON.stringify(config.prices[0])}
        </button>
      )}
    </div>
  );
}
