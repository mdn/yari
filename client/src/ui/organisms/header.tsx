import * as React from "react";

import Login from "../../header/login";
import Logo from "../atoms/logo";
import MainMenu from "../molecules/main-menu";
import Search from "../molecules/search-header";

import "./header.scss";

export default function Header() {
  return (
    <header className="page-header">
      <Logo />
      <MainMenu />
      <Search />
      <Login />
    </header>
  );
}
