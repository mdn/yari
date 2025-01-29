import React, { createElement } from "react";

import { useIsServer, useLocale } from "../hooks";
import { MainContentContainer } from "../ui/atoms/page-content";
import { useUserData } from "../user-context";

import "./index.scss";

export function Newsletter() {
  return (
    <MainContentContainer className="section-newsletter">
      <SignUpForm sendUsersToSettings={true} />
    </MainContentContainer>
  );
}

function SignUpForm({ sendUsersToSettings = false, section = false }) {
  const isServer = useIsServer();
  const user = useUserData();
  const locale = useLocale();

  return (
    <>
      {createElement(section ? "h2" : "h1", null, "Stay Informed with MDN")}
      <p>We're decommissioning our MDN Plus newsletter.</p>
      <p>
        <strong>
          We will automatically unsubscribe you and purge all related data soon.
        </strong>
      </p>
      {sendUsersToSettings && user?.isAuthenticated && !isServer ? (
        <p>
          Unsubscribe now via the{" "}
          <a href={`/${locale}/plus/settings#newsletter`} rel="_blank">
            Settings Page.
          </a>
        </p>
      ) : (
        <></>
      )}
    </>
  );
}

export function SignUpSection() {
  return (
    <section className="section-newsletter">
      <SignUpForm sendUsersToSettings={true} section={true} />
    </section>
  );
}
