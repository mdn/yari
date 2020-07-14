import * as React from "react";

import { useLocale } from "../hooks";
import Login from "./login";
import { ReactComponent as Logo } from "./logo.svg";
import MainMenu from "./main-menu";
import Search from "./search";

import "../kumastyles/minimalist/organisms/header.scss";

export default function Header() {
  const locale = useLocale();

  return (
    <header className="page-header">
      <a href={`/${locale}/`} className="logo" aria-label="MDN Web Docs">
        <Logo />
      </a>
      <MainMenu />
      <Search />
      <Login />
    </header>
  );
}
