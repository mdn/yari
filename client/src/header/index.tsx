import * as React from "react";

import Login from "./login";
import Logo from "../atoms/logo";
import MainMenu from "./main-menu";
import Search from "./search";

import "../kumastyles/minimalist/organisms/header.scss";

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
