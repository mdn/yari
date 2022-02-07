import React, { MouseEventHandler } from "react";
import { Button } from "../../atoms/button";

import "./index.scss";

export interface ToastData {
  mainText: string;
  isImportant?: boolean;
  closeHandler?: React.MouseEventHandler;
  secondaryText?: string;
  buttonText?: string;
  buttonHandler?: React.MouseEventHandler;
}

export default function Toast({
  isImportant,
  mainText,
  secondaryText,
  buttonText,
  buttonHandler,
  closeHandler = () => {},
}: ToastData) {
  return (
    <div className={`toast ${isImportant ? `is-important` : null}`}>
      <div className="toast-content">
        <span className="toast-primary-text">{mainText}</span>
        {secondaryText ? (
          <span className="toast-secondary-text"> {secondaryText}</span>
        ) : null}
      </div>
      {buttonText && buttonHandler ? (
        <Button type="action" onClickHandler={buttonHandler}>
          {buttonText}
        </Button>
      ) : null}
      <Button type="action" icon="cancel" onClickHandler={closeHandler} />
    </div>
  );
}
