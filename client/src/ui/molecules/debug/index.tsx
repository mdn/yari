import { useEffect, useRef, useState } from "react";

import "./index.scss";

export default function Debug() {
  return (
    <div className="debug">
      <DebugScrollDepth />
    </div>
  );
}

function DebugScrollDepth() {
  const ref = useRef<HTMLDivElement>(null);
  const [scrollHeight, setScrollHeight] = useState<number>(0);

  useEffect(() => {
    const root = ref.current;

    if (!root || !scrollHeight) {
      return;
    }

    const depths = [25, 50, 75, 90];
    depths.forEach((depth) => {
      const div = document.createElement("div");
      div.className = "depth";
      div.dataset.text = `${depth}%`;
      div.style.top = `${(depth / 100) * scrollHeight}px`;
      root.appendChild(div);
    });

    return () =>
      Array.from(root.children).forEach((child) => root.removeChild(child));
  }, [ref, scrollHeight]);

  useEffect(() => {
    const handler = () => {
      setScrollHeight(document.documentElement.scrollHeight);
    };

    const observer = new MutationObserver(handler);

    observer.observe(document.body, {
      childList: true, // Monitor for added/removed elements
      subtree: true, // Monitor all descendants of body
      attributes: true, // Monitor attribute changes (can affect size)
      characterData: true, // Monitor text content changes
    });

    return () => observer.disconnect();
  }, []);

  return <div ref={ref} className="scroll-depth" />;
}
