import React, { useState } from "react";
import Toast, { ToastData } from "./ui/atoms/toast";

interface UIStatus {
  isSidebarOpen: boolean;
  setIsSidebarOpen: Function;
  setToastData: Function;
}

const UIContext = React.createContext<UIStatus>({
  isSidebarOpen: false,
  setIsSidebarOpen: () => {},
  setToastData: () => {},
});

export function UIProvider(props: any) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [toastData, setToastData] = useState<ToastData | null>(null);

  return (
    <UIContext.Provider
      value={{
        isSidebarOpen,
        setIsSidebarOpen,
        setToastData,
      }}
    >
      {props.children}
      {toastData ? (
        <Toast
          {...toastData}
          closeHandler={(e) => {
            if (toastData?.closeHandler) toastData.closeHandler(e);
            setToastData(null);
          }}
        />
      ) : null}
    </UIContext.Provider>
  );
}

export function useUIStatus() {
  return React.useContext(UIContext);
}
