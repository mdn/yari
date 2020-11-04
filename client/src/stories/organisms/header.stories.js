import React from "react";

import { Header } from "../../ui/organisms/header";

const config = {
  title: "Organisms/Header",
};

export default config;

export const header = () => (
  <>
    <Header />
    <div className="page-overlay hidden"></div>
  </>
);
