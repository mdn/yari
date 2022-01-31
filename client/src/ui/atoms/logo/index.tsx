import { useLocation } from "react-router-dom";

import { useLocale } from "../../../hooks";

import { ReactComponent as MDNDocsLogo } from "../../../assets/mdn-docs-logo.svg";
import { ReactComponent as MDNPlusLogo } from "../../../assets/mdn-plus-logo.svg";

import "./index.scss";

export function Logo() {
  const locale = useLocale();
  const location = useLocation();

  const isPlus = location.pathname.indexOf("/plus") > -1 ? true : false;

  return (
    <a href={`/${locale}/`} className="logo" aria-label="MDN homepage">
      {isPlus ? <MDNPlusLogo /> : <MDNDocsLogo />}
    </a>
  );
}
