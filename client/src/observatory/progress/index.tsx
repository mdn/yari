import React from "react";

import "./index.scss";

export function useTimeout(callback: React.EffectCallback, delay: number) {
  React.useEffect(() => {
    const timeout = setTimeout(callback, delay);
    return () => clearTimeout(timeout);
  }, [delay, callback]);
}

export function Progress({ message = "Scanning…" }: { message?: string }) {
  return (
    <div className="progress">
      <p id="progress-title">{message}</p>
      <div
        className="progress-bar"
        role="progressbar"
        aria-labelledby="progress-title"
      >
        <div className="progress-bar-value"></div>
      </div>
    </div>
  );
}
