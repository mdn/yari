import React from "react";

import Codepen from "../../dinocons/brands/codepen-logo.svg";
import GitHubMarkLarge from "../../dinocons/brands/github-mark-large.svg";
import GitHubMarkSmall from "../../dinocons/brands/github-mark-small.svg";
import GoogleColor from "../../dinocons/brands/google-color.svg";
import GoogleMono from "../../dinocons/brands/google-mono.svg";
import JSFiddle from "../../dinocons/brands/jsfiddle.svg";
import MDNDino from "../../dinocons/brands/mdn-dino.svg";
import MDNDinoGradient from "../../dinocons/brands/mdn-dino-gradient.svg";

export default {
  title: "Atoms|Dinocons|Brands"
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

export const brands = () => (
  <>
    <h2>Brands</h2>
    <div style={wrapperStyle}>
      <div style={iconContainer}>
        <Codepen />
      </div>
      <div style={iconContainer}>
        <GitHubMarkLarge />
      </div>
      <div style={iconContainer}>
        <GitHubMarkSmall />
      </div>
      <div style={iconContainer}>
        <GoogleColor />
      </div>
      <div style={iconContainer}>
        <GoogleMono />
      </div>
      <div style={iconContainer}>
        <JSFiddle />
      </div>
      <div style={iconContainer}>
        <MDNDino />
      </div>
      <div style={iconContainer}>
        <MDNDinoGradient />
      </div>
    </div>
  </>
);
