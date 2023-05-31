import { useLocation } from "react-router-dom";

import { useLocale } from "../../../hooks";

import { ReactComponent as MDNDocsLogo } from "../../../assets/mdn-docs-logo.svg";
import { ReactComponent as MDNPlusLogo } from "../../../assets/mdn-plus-logo.svg";
import { ReactComponent as MDNLogo } from "../../../assets/mdn-logo.svg";

import "./index.scss";
import { isDocs, isPlus } from "../../../utils";

export function Logo() {
  const locale = useLocale();
  const location = useLocation();

  const plus = isPlus(location.pathname);
  const docs = isDocs(location.pathname);

  return (
    <a href={`/${locale}/`} className="logo" aria-label="MDN homepage">
      {(plus && <MDNPlusLogo />) || (docs && <MDNDocsLogo />) || <MDNLogo />}
      <svg width="0" height="0">
        <defs>
          <linearGradient id="pride-gradient">
            <stop offset="0" />
            <stop offset=".2" />
            <stop offset=".4" />
            <stop offset=".6" />
            <stop offset=".8" />
            <stop offset="1" />
          </linearGradient>
          <linearGradient
            xlinkHref="#pride-gradient"
            id="pride-gradient-v"
            x1="0"
            x2="0"
            y1="0"
            y2="1"
            gradientUnits="objectBoundingBox"
          />
          <linearGradient
            xlinkHref="#pride-gradient"
            id="pride-gradient-h"
            x1="0"
            x2="1"
            y1="0"
            y2="0"
            gradientUnits="objectBoundingBox"
          />
        </defs>
      </svg>
    </a>
  );
}
