import { useEffect, useRef, useState } from "react";
import "./index.scss";

export function Tooltip({
  children,
  extraClasses,
}: {
  children: React.ReactNode;
  extraClasses?: string;
}) {
  let ref = useRef<HTMLSpanElement | null>(null);
  let [style, setStyle] = useState<any>([]);
  useEffect(() => {
    const rect = ref.current?.getBoundingClientRect();
    const x = (rect?.x || 0) + (rect?.width || 0) / 2;
    setStyle(Object.fromEntries([["--tooltip-x", `${x.toFixed(2)}px`]]));
  }, []);
  return (
    <>
      <span ref={ref} className={`tooltip-popup`} style={style}>
        {children}
      </span>
    </>
  );
}
