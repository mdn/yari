import * as React from "react";

import "./index.scss";

export const MainHeader = ({ className = "", children }) => {
  const ref = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (typeof ResizeObserver === "undefined") {
      // SSR.
      return;
    }

    const header = ref.current;
    if (header instanceof HTMLElement) {
      const style = document.documentElement.style;

      const observer = new ResizeObserver((entries: ResizeObserverEntry[]) => {
        for (const entry of entries) {
          style.setProperty(
            "--sticky-header-height",
            `${entry.contentRect.height}px`
          );
          break;
        }
      });

      observer.observe(header);

      return () => observer.disconnect();
    }
  }, []);

  return (
    <header ref={ref} className={`main-header ${className}`}>
      {children}
    </header>
  );
};
