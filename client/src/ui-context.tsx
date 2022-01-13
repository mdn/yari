import React from "react";
import { useState } from "react";
interface UIStatus {
  isSidebarOpen: boolean;
  setIsSidebarOpen: Function;
}

const UIContext = React.createContext<UIStatus>({
  isSidebarOpen: false,
  setIsSidebarOpen: () => {},
});

export function UIProvider(props: any) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <UIContext.Provider
      value={{
        isSidebarOpen,
        setIsSidebarOpen,
      }}
    >
      {props.children}
    </UIContext.Provider>
  );
}

export function useUIStatus() {
  return React.useContext(UIContext);
}
