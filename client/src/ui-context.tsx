// @ts-expect-error ts-migrate(1259) FIXME: Module '"/Users/claas/github/mdn/yari/node_modules... Remove this comment to see the full error message
import React, { useState } from "react";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module './ui/atoms/toast'. Did you mea... Remove this comment to see the full error message
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
