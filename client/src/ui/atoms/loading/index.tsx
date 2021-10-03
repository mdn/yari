import React from "react";

import "./index.scss";

export function useTimeout(callback: React.EffectCallback, delay: number) {
  React.useEffect(() => {
    const timeout = setTimeout(callback, delay);
    return () => clearTimeout(timeout);
  }, [delay, callback]);
}

export function Loading({
  message = "Loading…",
  delay = 1000,
  minHeight = 200,
}: {
  message?: string;
  delay?: number;
  minHeight?: number;
}) {
  const [show, enableShow] = React.useReducer(() => true, false);
  useTimeout(enableShow, delay);
  const style = { minHeight };
  return (
    <div className="generic-loading" style={style}>
      <p>{show ? message : ""}</p>
    </div>
  );
}
