import * as React from "react";

import { useLocale } from "../../hooks";
import { ReactComponent as LogoSVG } from "../../assets/logo.svg";

import "./logo.scss";

export default function Logo() {
  const locale = useLocale();

  return (
    <a href={`/${locale}`} className="logo" aria-label="MDN Web Docs">
      <LogoSVG />
    </a>
  );
}
