import React from "react";
import { BrowserRouter as Router } from "react-router-dom";

import LanguageMenu from "../../ui/molecules/language-menu";

import { languageMenuData } from "../mocks/language-menu";

const config = {
  title: "Molecules/Language Menu",
};

export default config;

export const languageMenu = () => {
  return (
    <Router>
      <LanguageMenu
        locale={languageMenuData.locale}
        translations={languageMenuData.translations}
      />
    </Router>
  );
};
