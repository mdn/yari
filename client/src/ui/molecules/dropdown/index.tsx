import * as React from "react";
import { useContext, useRef } from "react";
import { useOnClickOutside } from "../../../hooks";

const DropdownMenuContext = React.createContext<{
  isOpen: boolean;
  close: () => void;
  wrapperRef?: React.Ref<HTMLDivElement>;
}>({
  isOpen: false,
  close: () => {},
});

export function DropdownMenuWrapper({
  className = "",
  children,
  isOpen,
  setIsOpen,
  useLIs = false,
}) {
  const wrapperRef = useRef(null);
  const close = () => setIsOpen(false);

  const contextValue = {
    close,
    wrapperRef,
    isOpen,
  };

  if (useLIs) {
    return (
      <li ref={wrapperRef} className={className}>
        <DropdownMenuContext.Provider value={contextValue}>
          {children}
        </DropdownMenuContext.Provider>
      </li>
    );
  }

  return (
    <div ref={wrapperRef} className={className}>
      <DropdownMenuContext.Provider value={contextValue}>
        {children}
      </DropdownMenuContext.Provider>
    </div>
  );
}

export function DropdownMenu({ children, onClose = () => {} }) {
  const { isOpen, wrapperRef, close } = useContext(DropdownMenuContext);

  React.useEffect(() => {
    const closeOnEsc = (event) => {
      if (event.key === "Escape" && isOpen) {
        close();
        onClose();
      }
    };
    document.addEventListener("keyup", closeOnEsc);

    return () => {
      document.removeEventListener("keyup", closeOnEsc);
    };
  }, [isOpen, close]);

  useOnClickOutside(wrapperRef, () => {
    if (isOpen) {
      close();
      onClose();
    }
  });
  if (!isOpen) return null;

  return <>{children}</>;
}
