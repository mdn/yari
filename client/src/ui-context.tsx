import React, { useCallback, useState } from "react";
import Toast, { ToastData } from "./ui/atoms/toast";
import { Theme } from "./types/theme";

interface UIStatus {
  toggleMobileOverlay: (id: Overlay, shown?: boolean) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setToastData: React.Dispatch<React.SetStateAction<ToastData | null>>;
  colorScheme: Theme;
  setColorScheme: React.Dispatch<React.SetStateAction<Theme>>;
}

export enum Overlay {
  Sidebar,
  ArticleActions,
  WatchMenu,
  BookmarkMenu,
}

const UIContext = React.createContext<UIStatus>({
  toggleMobileOverlay: () => {},
  isSidebarOpen: false,
  setIsSidebarOpen: () => {},
  setToastData: () => {},
  colorScheme: "os-default",
  setColorScheme: () => {},
});

export function UIProvider(props: any) {
  const initialTheme = window.localStorage.getItem("theme");
  const [mobileOverlays, setMobileOverlays] = useState<Set<Overlay>>(new Set());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [toastData, setToastData] = useState<ToastData | null>(null);
  const [colorScheme, setColorScheme] = useState<Theme>(
    (initialTheme as Theme) || "os-default"
  );

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
    const setDark = (event) => {
      if (event.matches) {
        setColorScheme("dark");
      }
    };
    const setLight = (event) => {
      if (event.matches) {
        setColorScheme("light");
      }
    };
    const dark = window.matchMedia("(prefers-color-scheme: dark)");
    if (dark.matches) {
      setColorScheme("dark");
    }
    dark.addEventListener("change", setDark);
    const light = window.matchMedia("(prefers-color-scheme: light)");
    if (dark.matches) {
      setColorScheme("dark");
    }
    light.addEventListener("change", setLight);
    return () => {
      light.removeEventListener("change", setLight);
      dark.removeEventListener("change", setDark);
    };
  }, []);

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
        isSidebarOpen,
        setIsSidebarOpen,
        setToastData,
        colorScheme,
        setColorScheme,
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
