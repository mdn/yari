import React, { useState } from "react";

import { useIsServer } from "../hooks";
import { Button } from "../ui/atoms/button";
import { MainContentContainer } from "../ui/atoms/page-content";

import "./index.scss";

export function Newsletter() {
  return (
    <MainContentContainer className="main-newsletter">
      <SignUpForm />
    </MainContentContainer>
  );
}

function SignUpForm() {
  const isServer = useIsServer();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setPending(true);
    try {
      const response = await fetch("/api/v1/newsletter", {
        body: JSON.stringify({ email }),
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
      });
      if (!response.ok) {
        throw Error();
      }
    } catch {
      setError(true);
      setPending(false);
      return;
    }
    setSubmitted(true);
  };

  return submitted ? (
    <>
      <h1>Thanks!</h1>
      <p>
        If you haven't previously confirmed a subscription to a Mozilla-related
        newsletter, you may have to do so. Please check your inbox or your spam
        filter for an email from us.
      </p>
    </>
  ) : (
    <>
      <h1>Stay Informed with MDN</h1>
      <p>
        Get the MDN newsletter and never miss an update on the latest web
        development trends, tips, and best practices.
      </p>
      <form className="mdn-form mdn-form-big" onSubmit={submit}>
        <div className="mdn-form-item">
          <label htmlFor="newsletter_email">Your email address:</label>

          <input
            type="email"
            name="email"
            required={true}
            placeholder="yourname@example.com"
            id="newsletter_email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={pending}
          />
        </div>

        <div className="mdn-form-item">
          <label htmlFor="newsletter_privacy">
            <input
              type="checkbox"
              id="newsletter_privacy"
              name="privacy"
              required={true}
              disabled={pending}
            />{" "}
            I’m okay with Mozilla handling my info as explained in this{" "}
            <a
              href="https://www.mozilla.org/en-US/privacy/websites/"
              target="_blank"
              rel="noreferrer"
            >
              Privacy Notice
            </a>
          </label>
        </div>

        <div className="mdn-form-item">
          <Button buttonType="submit" isDisabled={pending || isServer}>
            {error ? "Something went wrong, try again" : "Sign Up Now"}
          </Button>
        </div>
      </form>
    </>
  );
}
