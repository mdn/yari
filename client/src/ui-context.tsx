import React, { useState } from "react";
import Toast, { ToastData } from "./ui/atoms/toast";

interface UIStatus {
  fullScreenOverlay: boolean;
  setFullScreenOverlay: React.Dispatch<React.SetStateAction<boolean>>;
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setToastData: React.Dispatch<React.SetStateAction<ToastData | null>>;
}

const UIContext = React.createContext<UIStatus>({
  fullScreenOverlay: false,
  setFullScreenOverlay: () => {},
  isSidebarOpen: false,
  setIsSidebarOpen: () => {},
  setToastData: () => {},
});

export function UIProvider(props: any) {
  const [fullScreenOverlay, setFullScreenOverlay] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [toastData, setToastData] = useState<ToastData | null>(null);

  React.useEffect(() => {
    setFullScreenOverlay(isSidebarOpen);
  }, [isSidebarOpen]);

  React.useEffect(() => {
    fullScreenOverlay
      ? document.body.classList.add("full-screen-overlay")
      : document.body.classList.remove("full-screen-overlay");
  }, [fullScreenOverlay]);

  return (
    <UIContext.Provider
      value={{
        fullScreenOverlay,
        setFullScreenOverlay,
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
