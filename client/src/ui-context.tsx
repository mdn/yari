import React from "react";

interface UIStatus {
  isSidebarOpen: boolean;
  setIsSidebarOpen: Function;
}

const UIContext = React.createContext<UIStatus>({
  isSidebarOpen: false,
  setIsSidebarOpen: () => {},
});

export default UIContext;
