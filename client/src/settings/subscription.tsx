import { useCallback, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

import { STRIPE_PRICE_ID, STRIPE_PUBLIC_KEY } from "../constants";

export type SubscriptionData = null | object;

async function redirectToStripeCheckout(csrfToken: string) {
  const formData = new URLSearchParams();
  formData.set("priceId", STRIPE_PRICE_ID!);
  const [stripe, response] = await Promise.all([
    loadStripe(STRIPE_PUBLIC_KEY!),

    fetch("/api/v1/subscriptions/checkout", {
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
    console.error(
      "error while creating checkout",
      response.status,
      " - ",
      response.statusText,
      await response.text()
    );
  }
}

async function redirectToStripeCustomerPortal(csrfToken: string) {
  const response = await fetch("/api/v1/subscriptions/customer_portal", {
    method: "POST",
    headers: {
      "X-CSRFToken": csrfToken,
    },
  });
  if (response.ok) {
    const { url } = await response.json();
    window.location.href = url;
  } else {
    console.error(
      "error while creating customer portal",
      response.status,
      " - ",
      response.statusText,
      await response.text()
    );
  }
}

export function Subscription({
  csrfmiddlewaretoken,
  current,
}: {
  csrfmiddlewaretoken: string;
  current: SubscriptionData;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const checkout = useCallback(() => {
    setIsLoading(true);
    return redirectToStripeCheckout(csrfmiddlewaretoken);
  }, [csrfmiddlewaretoken]);

  const manage = useCallback(() => {
    setIsLoading(true);
    return redirectToStripeCustomerPortal(csrfmiddlewaretoken);
  }, [csrfmiddlewaretoken]);

  return (
    <div>
      <h3>Subscription</h3>
      {current ? (
        <>
          <button disabled={isLoading} onClick={() => manage()}>
            Manage
          </button>
          <pre>{JSON.stringify(current, null, 2)}</pre>
        </>
      ) : (
        <button disabled={isLoading} onClick={() => checkout()}>
          Create
        </button>
      )}
    </div>
  );
}
