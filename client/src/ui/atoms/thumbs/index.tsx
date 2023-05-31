import { useState } from "react";
import { THUMBS } from "../../../telemetry/constants";
import { useGleanClick } from "../../../telemetry/glean-context";
import { Button } from "../button";

import "./index.scss";

export function GleanThumbs({
  feature,
  question = "Is this useful?",
  confirmation = "Thanks for your feedback!",
}: {
  feature: string;
  question?: string;
  confirmation?: string;
}) {
  const [submitted, setSubmitted] = useState(false);
  const gleanClick = useGleanClick();

  const handleThumbs = (value: "up" | "down") => {
    gleanClick(`${THUMBS}: ${feature} -> ${value}`);
    setSubmitted(true);
  };

  return (
    <section className="glean-thumbs">
      {!submitted ? (
        <>
          <span className="question">{question}</span>
          <Thumbs
            upLabel="This is useful."
            downLabel="This is NOT useful."
            onThumbsUp={() => handleThumbs("up")}
            onThumbsDown={() => handleThumbs("down")}
          />
        </>
      ) : (
        <span className="confirmation">{confirmation}</span>
      )}
    </section>
  );
}

export function Thumbs({
  upLabel = "Thumbs up",
  downLabel = "Thumbs down",
  onThumbsUp,
  onThumbsDown,
  size,
}: {
  upLabel?: string;
  downLabel?: string;
  onThumbsUp: React.MouseEventHandler;
  onThumbsDown: React.MouseEventHandler;
  size?: "small" | "medium";
}) {
  return (
    <>
      <Button
        type="action"
        extraClasses={"thumbs"}
        icon="thumbs-up"
        size={size}
        onClickHandler={onThumbsUp}
        title={upLabel}
      >
        <span className="visually-hidden">{upLabel}</span>
      </Button>
      <Button
        type="action"
        extraClasses={"thumbs"}
        icon="thumbs-down"
        size={size}
        onClickHandler={onThumbsDown}
        title={downLabel}
      >
        <span className="visually-hidden">{downLabel}</span>
      </Button>
    </>
  );
}
