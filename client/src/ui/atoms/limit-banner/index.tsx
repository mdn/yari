import React from "react";
import { useLocale } from "../../../hooks";
import "./index.scss";

export default function LimitBanner({ type = "collections" }) {
  const collections = [
    "You have 0 free saves remaining",
    "and unlock unlimited collections",
  ];
  const locale = useLocale();
  const text =
    type === "collections" ? collections : ["This should not happen!", "🤷‍♂️"];

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
