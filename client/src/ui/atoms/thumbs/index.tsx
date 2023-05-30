import { useState } from "react";
import { THUMBS } from "../../../telemetry/constants";
import { useGleanClick } from "../../../telemetry/glean-context";
import { Button } from "../button";

import "./index.scss";

export function GleanThumbs({ feature }: { feature: string }) {
  const [submitted, setSubmitted] = useState(false);
  const gleanClick = useGleanClick();

  const handleThumbs = (value: "up" | "down") => {
    gleanClick(`${THUMBS}: ${feature} -> ${value}`);
    setSubmitted(true);
  };

  return (
    <section className="glean-thumbs" title="Rate this feature">
      {submitted ? (
        <span className="thanks">Thanks for rating!</span>
      ) : (
        <>
          <Thumbs
            size="small"
            onThumbsUp={() => handleThumbs("up")}
            onThumbsDown={() => handleThumbs("down")}
          />
        </>
      )}
    </section>
  );
}

export function Thumbs({
  onThumbsUp,
  onThumbsDown,
  size,
}: {
  extraClasses?: string;
  onThumbsUp: React.MouseEventHandler;
  onThumbsDown: React.MouseEventHandler;
  size?: "small" | "medium";
}) {
  return (
    <section className="thumbs">
      <Button
        type="action"
        icon="thumbs-up"
        size={size}
        onClickHandler={onThumbsUp}
      >
        <span className="visually-hidden">Thumbs up</span>
      </Button>
      <Button
        type="action"
        icon="thumbs-down"
        size={size}
        onClickHandler={onThumbsDown}
      >
        <span className="visually-hidden">Thumbs down</span>
      </Button>
    </section>
  );
}
