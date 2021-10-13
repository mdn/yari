import { useLocation } from "react-router-dom";

import { useLocale } from "../../../hooks";

import "./index.scss";

export function Logo() {
  const locale = useLocale();
  const location = useLocation();

  const isPlus = location.pathname.indexOf("/plus") > -1 ? true : false;

  return (
    <a href={`/${locale}/`} className={isPlus ? "logo plus-logo" : "logo"}>
      <span className="visually-hidden">MDN Web Docs</span>
    </a>
  );
}
