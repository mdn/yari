import React from "react";

import Eye from "../../dinocons/tools/eye.svg";
import Gear from "../../dinocons/tools/gear.svg";
import Play from "../../dinocons/tools/play.svg";
import Undo from "../../dinocons/tools/undo.svg";

export default {
  title: "Atoms|Dinocons|Tools"
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

export const tools = () => (
  <>
    <h2>Tools</h2>
    <div style={wrapperStyle}>
      <div style={iconContainer}>
        <Eye />
      </div>
      <div style={iconContainer}>
        <Gear />
      </div>
      <div style={iconContainer}>
        <Play />
      </div>
      <div style={iconContainer}>
        <Undo />
      </div>
    </div>
  </>
);
