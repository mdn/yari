import React, { useEffect, useState } from "react";
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

  const [mdnLogo, setMdnLogo] = useState<any>(null);
  useEffect(() => {
    if (isPlus(location.pathname)) {
      setMdnLogo(<MDNPlusLogo />);
    } else if (isDocs(location.pathname)) {
      setMdnLogo(<MDNDocsLogo />);
    } else {
      setMdnLogo(<MDNLogo />);
    }
  }, [location]);

  return (
    <a href={`/${locale}/`} className="logo" aria-label="MDN homepage">
      {mdnLogo}
    </a>
  );
}
