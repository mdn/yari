import React from "react";

import Instagram from "../../dinocons/social/instagram.svg";
import Twitter from "../../dinocons/social/twitter.svg";

export default {
  title: "Atoms|Dinocons|Social"
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

export const social = () => (
  <>
    <h2>Social</h2>
    <div style={wrapperStyle}>
      <div style={iconContainer}>
        <Instagram />
      </div>
      <div style={iconContainer}>
        <Twitter />
      </div>
    </div>
  </>
);
