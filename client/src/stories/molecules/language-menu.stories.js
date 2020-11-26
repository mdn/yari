import React from "react";
import { BrowserRouter as Router } from "react-router-dom";

import LanguageMenu from "../../ui/molecules/language-menu";

import { languageMenuData } from "../mocks/language-menu";

const defaults = {
  title: "Molecules/Language Menu",
};

export default defaults;

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
