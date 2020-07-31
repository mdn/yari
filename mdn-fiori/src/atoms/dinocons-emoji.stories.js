import React from "react";

import Frown from "../../dinocons/emojis/frown.svg";
import Smiley from "../../dinocons/emojis/smiley.svg";
import ThumbsDown from "../../dinocons/emojis/thumbs-down.svg";
import ThumbsUp from "../../dinocons/emojis/thumbs-up.svg";

export default {
  title: "Atoms|Dinocons|Emoji"
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

export const emoji = () => (
  <>
    <h2>Emoji</h2>
    <div style={wrapperStyle}>
      <div style={iconContainer}>
        <Frown />
      </div>
      <div style={iconContainer}>
        <Smiley />
      </div>
      <div style={iconContainer}>
        <ThumbsDown />
      </div>
      <div style={iconContainer}>
        <ThumbsUp />
      </div>
    </div>
  </>
);
