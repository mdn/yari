import * as React from "react";

import { useLocale } from "../hooks";
import Login from "./login";
import Logo from "./logo.svg";
import MainMenu from "./main-menu";
import Search from "./search";

import "../kumastyles/minimalist/organisms/header.scss";

export default function Header() {
  const locale = useLocale();

  return (
    <header className="page-header">
      <a href={`/${locale}/`} className="logo" aria-label="MDN Web Docs">
        {/* XXX This needs to NOT be an image but a real svg
            See https://github.com/mdn/yari/issues/882
             */}
        <img src={Logo} alt="logo" />
      </a>
      <MainMenu />
      <Search />
      <Login />
    </header>
  );
}
