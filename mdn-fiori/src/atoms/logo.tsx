import * as React from "react";

import LogoSVG from "../assets/logo.svg";

import "./logo.scss";

export default function Logo() {
  return (
    <a href="/" className="logo" aria-label="MDN Web Docs">
      <LogoSVG />
    </a>
  );
}
