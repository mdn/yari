import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";

import { useIsServer } from "../hooks";
import { Loading } from "../ui/atoms/loading";
import { MainContentContainer } from "../ui/atoms/page-content";

interface LayoutProps {
  withoutContainer?: boolean;
  withSSR?: boolean;
  children: React.ReactNode;
}

function Layout({
  withoutContainer = false,
  withSSR = false,
  children,
}: LayoutProps) {
  const loading = <Loading message={`Loading…`} minHeight={800} />;
  const isServer = useIsServer();
  const inner = (
    <>
      {isServer ? (
        withSSR ? (
          children
        ) : (
          loading
        )
      ) : (
        <React.Suspense fallback={loading}>{children}</React.Suspense>
      )}
    </>
  );

  return withoutContainer ? (
    inner
  ) : (
    <>
      <MainContentContainer>{inner}</MainContentContainer>
    </>
  );
}

export function Newsletter({ pageTitle, ...props }: { pageTitle?: string }) {
  return (
    <Layout>
      <SignUpForm />
    </Layout>
  );
}

function SignUpForm() {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const subscribe = async () => {
    await fetch("/api/v1/newsletter", {
      body: JSON.stringify({ email }),
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
    });
    setSubmitted(true);
  };

  return submitted ? (
    <h1>Thank you</h1>
  ) : (
    <form
      onSubmit={(event: React.FormEvent) => {
        event.preventDefault();
        subscribe();
      }}
    >
      <h1>Love MDN</h1>
      <p>Get the MDN's newsletter and help us keep the web open and free.</p>
      <fieldset className="p-newsletter-fieldset">
        <label htmlFor="id_email">Your email address:</label>

        <input
          type="email"
          name="email"
          required={true}
          placeholder="yourname@example.com"
          className="p-newsletter-input"
          id="id_email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <p>
          <label htmlFor="privacy" className="p-newsletter-privacy-check">
            <input
              type="checkbox"
              id="privacy"
              name="privacy"
              required={true}
              aria-required="true"
            />{" "}
            I’m okay with Mozilla handling my info as explained in{" "}
            <a href="/en-US/privacy/websites/">this Privacy Notice</a>
          </label>
        </p>

        <button type="submit" id="newsletter-submit" className="button">
          Sign Up Now
        </button>
      </fieldset>
    </form>
  );
}
