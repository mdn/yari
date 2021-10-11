import React from "react";

import { Button } from "../../ui/atoms/button";

const defaults = {
  title: "Atoms/Button",
  component: Button,
};

export default defaults;

export const button = (args) => <Button {...args}>Button title</Button>;
