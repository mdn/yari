import React, { useEffect } from "react";

export type SearchProps = {
  id: string;
  inputValue: string;
  onChangeInputValue: (value: string) => void;
  isFocused: boolean;
  onChangeIsFocused: (isFocused: boolean) => void;
};

export function useFocusOnSlash(
  inputRef: React.RefObject<null | HTMLInputElement>,
  { onFocus }: { onFocus?: () => void } = {}
) {
  useEffect(() => {
    function focusOnSearchMaybe(event) {
      const input = inputRef.current;
      if (
        event.key === "/" &&
        !event.ctrlKey &&
        !event.metaKey &&
        !["TEXTAREA", "INPUT"].includes(event.target.tagName)
      ) {
        if (input && document.activeElement !== input) {
          event.preventDefault();
          input.focus();
          onFocus?.();
        }
      }
    }
    document.addEventListener("keydown", focusOnSearchMaybe);
    return () => {
      document.removeEventListener("keydown", focusOnSearchMaybe);
    };
  }, [inputRef, onFocus]);
}
