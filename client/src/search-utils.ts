import React, { useEffect } from "react";

export type SearchProps = {
  id: string;
  inputValue: string;
  onChangeInputValue: (value: string) => void;
  isFocused: boolean;
  onChangeIsFocused: (isFocused: boolean) => void;
  onResultClick: (
    value: string,
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => void;
};

export function useFocusViaKeyboard(
  inputRef: React.RefObject<null | HTMLInputElement>
) {
  useEffect(() => {
    function focusOnSearchMaybe(event: KeyboardEvent) {
      const input = inputRef.current;
      const target = event.target as HTMLElement;
      const keyPressed = event.key;
      const ctrlOrMetaPressed = event.ctrlKey || event.metaKey;
      const isSlash = keyPressed === "/" && !ctrlOrMetaPressed;
      const isCtrlK =
        keyPressed === "k" && ctrlOrMetaPressed && !event.shiftKey;
      const isTextField =
        ["TEXTAREA", "INPUT"].includes(target.tagName) ||
        target.isContentEditable;
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
