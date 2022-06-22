import React, { useEffect } from "react";

export type SearchProps = {
  id: string;
  inputValue: string;
  onChangeInputValue: (value: string) => void;
  isFocused: boolean;
  onChangeIsFocused: (isFocused: boolean) => void;
};

export function useFocusViaKeyboard(
  inputRef: React.RefObject<null | HTMLInputElement>
) {
  useEffect(() => {
    function focusOnSearchMaybe(event) {
      const input = inputRef.current;
      const keyPressed = event.key;
      const ctrlOrMetaPressed = event.ctrlKey || event.metaKey;
      const isSlash = keyPressed === "/" && !ctrlOrMetaPressed;
      const isCtrlK = keyPressed.toLowerCase() === "k" && ctrlOrMetaPressed;
      const isTextField = ["TEXTAREA", "INPUT"].includes(event.target.tagName);
      if ((isSlash || isCtrlK) && !isTextField) {
        if (input && document.activeElement !== input) {
          event.preventDefault();
          input.focus();
        }
      }
    }
    document.addEventListener("keydown", focusOnSearchMaybe);
    return () => {
      document.removeEventListener("keydown", focusOnSearchMaybe);
    };
  }, [inputRef]);
}
