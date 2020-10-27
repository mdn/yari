import React from "react";

import { Logo } from "../../ui/atoms/logo";

export default {
  title: "Atoms/Logo",
};

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
