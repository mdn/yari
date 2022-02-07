import React, { MouseEventHandler } from "react";

import "./index.scss";

export interface ToastData {
  mainText: string;
  closeHandler?: MouseEventHandler<HTMLButtonElement>;
  secondaryText?: string;
  buttonText?: string;
  buttonHandler?: MouseEventHandler<HTMLButtonElement>;
}

export default function Toast({
  mainText,
  secondaryText,
  buttonText,
  buttonHandler,
  closeHandler = () => {},
}: ToastData) {
  return (
    <div className="toast">
      {mainText}
      {secondaryText}
      {buttonText && buttonHandler ? (
        <button type="button" onClick={buttonHandler}>
          {buttonText}
        </button>
      ) : null}
      <button type="button" onClick={closeHandler}>
        X
      </button>
    </div>
  );
}
