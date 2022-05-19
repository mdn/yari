// @ts-expect-error ts-migrate(1259) FIXME: Module '"/Users/claas/github/mdn/yari/node_modules... Remove this comment to see the full error message
import React from "react";
import { useLocale } from "../../../hooks";
import "./index.scss";

export default function LimitBanner({ type = "collections" }) {
  const collections = [
    "You have 0 free saves remaining",
    "and unlock unlimited collections",
  ];
  const notifications = [
    "You have reached the limit of articles you can watch",
    "and watch unlimited articles!",
  ];
  const locale = useLocale();
  const text = type === "collections" ? collections : notifications;

  return (
    <div className="limit-banner">
      <p>
        {text[0]}
        <br />
        <a href={`/${locale}/plus`}>
          <strong>Become an MDN Plus subscriber </strong>
        </a>
        {text[1]}
      </p>
    </div>
  );
}
