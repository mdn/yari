import React from "react";
import { AuthContainer } from "../../ui/molecules/auth-container";
import "./login-banner.scss";
import { usePlusUrl } from "../utils";
import { PLUS_UPDATES } from "../../telemetry/constants";
import { useGleanClick } from "../../telemetry/glean-context";

export function LoginBanner() {
  const href = usePlusUrl();
  const gleanClick = useGleanClick();

  return (
    <div className="login-banner">
      <span>
        <strong>
          Upgrade to{" "}
          <a
            className="plus-link"
            href={href}
            onClick={() => gleanClick(`${PLUS_UPDATES.MDN_PLUS}: banner-link`)}
          >
            MDN Plus
          </a>
        </strong>
        . Use filters to browse the updates.
      </span>
      <AuthContainer gleanContext={`${PLUS_UPDATES.MDN_PLUS}: banner-button`} />
    </div>
  );
}
