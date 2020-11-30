import React from "react";

import { Logo } from "../../ui/atoms/logo";

const defaults = {
  title: "Atoms/Logo",
};

export default defaults;

const wrapper = {
  backgroundColor: "#212121",
  padding: "24px",
};

export const logo = () => <Logo />;

export const logoDark = () => {
  return (
    <footer style={wrapper}>
      <Logo mode="dark" />
    </footer>
  );
};
