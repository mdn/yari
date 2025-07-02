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
    </a>
  );
}
