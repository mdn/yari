import * as React from "react";
import { useContext, useRef } from "react";
import { useOnClickOutside } from "../../../hooks";

import "./index.scss";

const DropdownMenuContext = React.createContext<{
  isOpen: boolean;
  close: (event?: Event) => void;
  wrapperRef?: React.Ref<HTMLDivElement>;
  disableAutoClose: boolean;
}>({
  isOpen: false,
  close: () => {},
  disableAutoClose: false,
});

export function DropdownMenuWrapper({
  className = "",
  children,
  isOpen,
  setIsOpen,
  useLIs = false,
  disableAutoClose = false,
}) {
  const wrapperRef = useRef(null);
  const close = (event) => setIsOpen(false, event);

  const contextValue = {
    close,
    wrapperRef,
    isOpen,
    disableAutoClose,
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
  alwaysRenderChildren = false,
  onClose = () => {},
}: {
  children: React.ReactNode;
  alwaysRenderChildren?: boolean;
  onClose?: (event?: Event) => void;
}) {
  const { isOpen, wrapperRef, close, disableAutoClose } =
    useContext(DropdownMenuContext);

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
    if (isOpen && !disableAutoClose) {
      close(event);
      onClose(event);
    }
  });

  if (alwaysRenderChildren) {
    return <div className={isOpen ? "contents" : "hidden"}>{children}</div>;
  } else if (!isOpen) {
    return null;
  }

  return <>{children}</>;
}
