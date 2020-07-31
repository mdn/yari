import * as React from "react";

import Logo from "../atoms/logo.tsx";
import MainMenu from "../molecules/main-menu.jsx";
import SearchHeader from "../molecules/search-header.jsx";

import "./header.scss";

export default function Header() {
  return (
    <header className="page-header" data-testid="header">
      <Logo />
      <MainMenu />
      <SearchHeader initialQuery="" />
    </header>
  );
}
