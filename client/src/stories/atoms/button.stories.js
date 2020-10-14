import React from "react";

import { Button } from "../../ui/atoms/button/index.tsx";

import { ReactComponent as Arrow } from "@mdn/dinocons/arrows/arrow.svg";
import { ReactComponent as Github } from "@mdn/dinocons/brands/github-mark-small.svg";

export default {
  title: "Atoms/Buttons",
};

export const primaryButton = () => <Button>Primary button</Button>;
export const outline = () => <Button state="outline">Primary button</Button>;

export const postive = () => <Button state="positive">Subscribe</Button>;
export const positiveOutline = () => (
  <Button state="outline positive">Back</Button>
);

export const danger = () => <Button state="danger">Close account</Button>;
export const dangerOutline = () => (
  <Button state="outline danger">Cancel</Button>
);

export const inactive = () => <Button state="inactive">Processing...</Button>;

export const iconRight = () => (
  <Button state="positive icon-button right">
    Icon on right <Arrow />
  </Button>
);
export const iconLeft = () => (
  <Button state="positive icon-button left">
    <Github /> Icon on right
  </Button>
);
