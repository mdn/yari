import React from "react";

import Arrow from "../../dinocons/arrows/arrow.svg";
import Chevron from "../../dinocons/arrows/chevron.svg";
import Triangle from "../../dinocons/arrows/triangle.svg";

export default {
  title: "Atoms|Dinocons|Arrows"
};

const wrapperStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "20px"
};

const iconContainer = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  margin: "24px",
  padding: "5px",
  border: "1px solid #212121",
  width: "100px",
  height: "100px"
};

export const arrows = () => (
  <>
    <h2>Arrows</h2>
    <div style={wrapperStyle}>
      <div style={iconContainer}>
        <Arrow />
      </div>
      <div style={iconContainer}>
        <Chevron />
      </div>
      <div style={iconContainer}>
        <Triangle />
      </div>
    </div>
  </>
);
