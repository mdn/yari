import React from "react";

import { ReactComponent as ArrowIcon } from "@mdn/dinocons/arrows/arrow.svg";
import { ReactComponent as ChevronIcon } from "@mdn/dinocons/arrows/chevron.svg";
import { ReactComponent as TriangleIcon } from "@mdn/dinocons/arrows/triangle.svg";

export default {
  title: "Atoms/Dinocons/Arrows",
};

export const Arrow = () => <ArrowIcon />;
export const Chevron = () => <ChevronIcon />;
export const Triangle = () => <TriangleIcon />;
