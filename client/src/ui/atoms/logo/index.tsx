import { useLocation } from "react-router-dom";

import { useLocale } from "../../../hooks";

import MDNLogo from "../mdn-logo";
import MDNDocsLogo from "../mdn-docs-logo";
import MDNPlusLogo from "../mdn-plus-logo";

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
