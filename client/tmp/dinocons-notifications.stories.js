import React from "react";

import ExclamationCircle from "../../dinocons/notifications/exclamation-circle.svg";
import ExclamationTriangle from "../../dinocons/notifications/exclamation-triangle.svg";
import InfoCircle from "../../dinocons/notifications/info-circle.svg";
import Question from "../../dinocons/notifications/question.svg";

export default {
  title: "Atoms|Dinocons|Notifications"
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

export const notifications = () => (
  <>
    <h2>Notifications</h2>
    <div style={wrapperStyle}>
      <div style={iconContainer}>
        <ExclamationCircle />
      </div>
      <div style={iconContainer}>
        <ExclamationTriangle />
      </div>
      <div style={iconContainer}>
        <InfoCircle />
      </div>
      <div style={iconContainer}>
        <Question />
      </div>
    </div>
  </>
);
