import { useEffect, useRef, useState } from "react";
import "./index.scss";
import { ReactComponent as ArrowSVG } from "../../../public/assets/observatory/tooltip-arrow.svg";

export function Tooltip({
  children,
  extraClasses,
}: {
  children: React.ReactNode;
  extraClasses?: string;
}) {
  let ref = useRef<HTMLSpanElement | null>(null);
  let [style, setStyle] = useState<Record<string, string>>({});
  useEffect(() => {
    const onResize = () => {
      const parentRect = ref.current?.parentElement?.getBoundingClientRect();
      const parentWH = (parentRect?.width || 0) / 2;
      const x = (parentRect?.x || 0) + parentWH;
      const rect = ref.current?.getBoundingClientRect();
      const wH = (rect?.width || 0) / 2;
      const iW = window.innerWidth;
      const offset =
        -1 *
        (x <= iW / 2 // if the center of the parent is on the left half of the window
          ? x < wH // if the center of the parent is smaller than half of the tooltip
            ? x
            : wH
          : // the center of the parent is on the right half of the window
            x > iW - wH // if the inner width of the window is less than half the tooltip
            ? 2 * wH - (iW - x)
            : wH);
      const tooltipOffset = `${offset.toFixed(2)}px`;
      setStyle(Object.fromEntries([["--tooltip-offset", tooltipOffset]]));
    };
    onResize();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [ref]);
  return (
    <>
      <span
        ref={ref}
        aria-describedby="grade-table"
        className={`tooltip-popup ${extraClasses || ""}`}
        style={style}
      >
        <ArrowSVG className="arrow" aria-hidden="true" />
        {children}
      </span>
    </>
  );
}
