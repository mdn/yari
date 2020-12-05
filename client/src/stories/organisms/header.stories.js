import React from "react";

import { Header } from "../../ui/organisms/header";

const defaults = {
  title: "Organisms/Header",
};

export default defaults;

export const header = () => (
  <>
    <Header />
    <div className="page-overlay hidden"></div>
  </>
);
