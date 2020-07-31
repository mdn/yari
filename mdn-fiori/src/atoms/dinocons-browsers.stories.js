import React from "react";

import Chrome from "../../dinocons/browsers/chrome.svg";
import Edge from "../../dinocons/browsers/edge.svg";
import Firefox from "../../dinocons/browsers/firefox.svg";
import InternetExplorer from "../../dinocons/browsers/internet-explorer.svg";
import Opera from "../../dinocons/browsers/opera.svg";
import Safari from "../../dinocons/browsers/safari.svg";
import SamsungInternet from "../../dinocons/browsers/samsung-internet.svg";

export default {
  title: "Atoms|Dinocons|Browsers"
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

export const browsers = () => (
  <>
    <h2>Browsers</h2>
    <div style={wrapperStyle}>
      <div style={iconContainer}>
        <Chrome />
      </div>
      <div style={iconContainer}>
        <Edge />
      </div>
      <div style={iconContainer}>
        <Firefox />
      </div>
      <div style={iconContainer}>
        <InternetExplorer />
      </div>
      <div style={iconContainer}>
        <Opera />
      </div>
      <div style={iconContainer}>
        <Safari />
      </div>
      <div style={iconContainer}>
        <SamsungInternet />
      </div>
    </div>
  </>
);
