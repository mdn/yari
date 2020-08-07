import React from "react";

import MenuClose from "../../dinocons/navigation/menu-close.svg";
import MenuOpen from "../../dinocons/navigation/menu-open.svg";

export default {
  title: "Atoms|Dinocons|Navigation"
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

export const navigation = () => (
  <>
    <h2>Navigation</h2>
    <div style={wrapperStyle}>
      <div style={iconContainer}>
        <MenuClose />
      </div>
      <div style={iconContainer}>
        <MenuOpen />
      </div>
    </div>
  </>
);
