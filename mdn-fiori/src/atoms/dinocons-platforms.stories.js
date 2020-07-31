import React from "react";

import Android from "../../dinocons/platforms/android.svg";
import Desktop from "../../dinocons/platforms/desktop.svg";
import Mobile from "../../dinocons/platforms/mobile.svg";
import Nodejs from "../../dinocons/platforms/nodejs.svg";
import Server from "../../dinocons/platforms/server.svg";

export default {
  title: "Atoms|Dinocons|Platforms"
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

export const platforms = () => (
  <>
    <h2>Platforms</h2>
    <div style={wrapperStyle}>
      <div style={iconContainer}>
        <Android />
      </div>
      <div style={iconContainer}>
        <Desktop />
      </div>
      <div style={iconContainer}>
        <Mobile />
      </div>
      <div style={iconContainer}>
        <Nodejs />
      </div>
      <div style={iconContainer}>
        <Server />
      </div>
    </div>
  </>
);
