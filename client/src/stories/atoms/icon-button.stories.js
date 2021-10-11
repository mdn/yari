import React from "react";

import { IconButton } from "../../ui/atoms/icon-button";

const defaults = {
  title: "Atoms/Icon Button",
  component: IconButton,
};

export default defaults;

function action() {
  console.log("Clicked");
}

export const openMenuIconButton = (args) => (
  <IconButton {...args} clickHandler={action}>
    <span className="visually-hidden">Open button</span>
  </IconButton>
);

openMenuIconButton.args = {
  ariaHasPopup: false,
  buttonType: "button",
  iconClassName: "menu-open",
};
