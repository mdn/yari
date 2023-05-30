import React, { useCallback, useState } from "react";
import Toast, { ToastData } from "./ui/atoms/toast";

interface UIStatus {
  toggleMobileOverlay: (id: Overlay, shown?: boolean) => void;
  isDialogOpen: boolean;
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setToastData: React.Dispatch<React.SetStateAction<ToastData | null>>;
}

export enum Overlay {
  Sidebar,
  ArticleActions,
  WatchMenu,
  BookmarkMenu,
}

const UIContext = React.createContext<UIStatus>({
  toggleMobileOverlay: () => {},
  isDialogOpen: false,
  setIsDialogOpen: () => {},
  isSidebarOpen: false,
  setIsSidebarOpen: () => {},
  setToastData: () => {},
});

export function UIProvider(props: any) {
  const [mobileOverlays, setMobileOverlays] = useState<Set<Overlay>>(new Set());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [toastData, setToastData] = useState<ToastData | null>(null);

  const toggleMobileOverlay = useCallback(
    (overlay: Overlay, shown?: boolean) => {
      setMobileOverlays((oldOverlays) => {
        const overlays = new Set(oldOverlays);
        if (typeof shown !== "boolean") {
          overlays.has(overlay)
            ? overlays.delete(overlay)
            : overlays.add(overlay);
        } else if (shown) {
          overlays.add(overlay);
        } else {
          overlays.delete(overlay);
        }
        // if the set hasn't changed, return the old set object
        // so react doesn't think it's been mutated
        return oldOverlays.size === overlays.size ? oldOverlays : overlays;
      });
    },
    []
  );

  React.useEffect(() => {
    toggleMobileOverlay(Overlay.Sidebar, isSidebarOpen);
  }, [isSidebarOpen, toggleMobileOverlay]);

  React.useEffect(() => {
    mobileOverlays.size
      ? document.body.classList.add("mobile-overlay-active")
      : document.body.classList.remove("mobile-overlay-active");
  }, [mobileOverlays]);

  return (
    <UIContext.Provider
      value={{
        toggleMobileOverlay,
        isDialogOpen,
        setIsDialogOpen,
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
