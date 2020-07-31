import * as React from "react";

import { useLocale } from "../hooks";
import Login from "./login";
// import { ReactComponent as Logo } from "./logo.svg";
import Logo from "mdn-fiori/src/atoms/logo";
import MainMenu from "./main-menu";
import Search from "./search";

import "../kumastyles/minimalist/organisms/header.scss";

export default function Header() {
  const locale = useLocale();

  return (
    <header className="page-header">
      <Logo />
      <MainMenu />
      <Search />
      <Login />
    </header>
  );
}
