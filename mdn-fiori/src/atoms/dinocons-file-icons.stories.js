import React from "react";

import File from "../../dinocons/file-icons/file.svg";
import PlainText from "../../dinocons/file-icons/plain-text.svg";

export default {
  title: "Atoms|Dinocons|File Icons"
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

export const fileIcons = () => (
  <>
    <h2>File Icons</h2>
    <div style={wrapperStyle}>
      <div style={iconContainer}>
        <File />
      </div>
      <div style={iconContainer}>
        <PlainText />
      </div>
    </div>
  </>
);
