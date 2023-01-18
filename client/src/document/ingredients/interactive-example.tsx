import { useEffect, useLayoutEffect, useRef } from "react";

interface InteractiveEditorHeight {
  minFrameWidth: number;
  height: number;
}
export type InteractiveEditorHeights = InteractiveEditorHeight[];
interface InteractiveEditor {
  name: string;
  heights: InteractiveEditorHeights;
}
export interface InteractiveExamplesHeightData {
  editors: InteractiveEditor[];
  examples: Record<string, string>;
}

/**
 * Replaces iframe created by EmbedInteractiveExample.ejs and sets its height dynamically based on editor heights provided from height-data.json
 */
export function InteractiveExample({
  src,
  heights,
}: {
  src: string;
  heights: InteractiveEditorHeights;
}) {
  const ref = useRef<HTMLIFrameElement>(null);

  useLayoutEffect(() => {
    if (ref.current) {
      setHeight(ref.current, heights);

      // Updating height whenever iframe is resized
      const observer = new ResizeObserver((entries) =>
        entries.forEach((e) =>
          setHeight(e.target as typeof ref.current, heights)
        )
      );
      observer.observe(ref.current);
      return () => (ref.current ? observer.unobserve(ref.current) : undefined);
    }
  }, [ref.current]);

  return (
    <iframe
      ref={ref}
      className="interactive"
      src={src}
      title="MDN Web Docs Interactive Example"
    ></iframe>
  );
}

function setHeight(frame: HTMLIFrameElement, heights) {
  const frameWidth = getIFrameWidth(frame);
  const height = calculateHeight(frameWidth, heights);
  frame.style.height = height;
}

/**
 * Calculates height of the iframe based on its width and data provided by height-data.json
 */
function calculateHeight(
  frameWidth: number,
  heights: InteractiveEditorHeights
) {
  let frameHeight = 0;
  for (const height of heights) {
    if (frameWidth >= height.minFrameWidth) {
      frameHeight = height.height;
    }
  }
  return `${frameHeight}px`;
}

function getIFrameWidth(frame: HTMLIFrameElement) {
  const styles = getComputedStyle(frame);

  return (
    frame.clientWidth -
    parseFloat(styles.paddingLeft) -
    parseFloat(styles.paddingRight)
  );
}
