// @ts-expect-error ts-migrate(1259) FIXME: Module '"/Users/claas/github/mdn/yari/node_modules... Remove this comment to see the full error message
import React from "react";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module '../../atoms/button'. Did you m... Remove this comment to see the full error message
import { Button } from "../../atoms/button";

import "./index.scss";

export interface ToastData {
  mainText: string;
  isImportant?: boolean;
  closeHandler?: React.MouseEventHandler;
  shortText?: string;
  buttonText?: string;
  buttonHandler?: React.MouseEventHandler;
}

export default function Toast({
  isImportant,
  mainText,
  shortText,
  buttonText,
  buttonHandler,
  closeHandler = () => {},
}: ToastData) {
  return (
    <div className={`toast ${isImportant ? `is-important` : null}`}>
      <div className="toast-content">
        {shortText ? (
          <>
            <span className="toast-verbose-text">{mainText}</span>
            <span className="toast-short-text"> {shortText}</span>
          </>
        ) : (
          <span>{mainText}</span>
        )}
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
