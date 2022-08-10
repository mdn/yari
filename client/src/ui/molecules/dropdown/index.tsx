import * as React from "react";
import { useContext, useRef } from "react";
import { useOnClickOutside } from "../../../hooks";

import "./index.scss";

const DropdownMenuContext = React.createContext<{
  isOpen: boolean;
  close: (event?: Event) => void;
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
  const close = (event) => setIsOpen(false, event);

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

export function DropdownMenu({
  children,
  onClose = () => {},
}: {
  children: React.ReactNode;
  onClose?: (event?: Event) => void;
}) {
  const { isOpen, wrapperRef, close } = useContext(DropdownMenuContext);

  React.useEffect(() => {
    const closeOnEsc = (event) => {
      if (event.key === "Escape" && isOpen) {
        close(event);
        onClose(event);
      }
    };
    document.addEventListener("keyup", closeOnEsc);

    return () => {
      document.removeEventListener("keyup", closeOnEsc);
    };
  }, [isOpen, close, onClose]);

  useOnClickOutside(wrapperRef, (event) => {
    if (isOpen) {
      close(event);
      onClose(event);
    }
  });
  if (!isOpen) return null;

  return <>{children}</>;
}
