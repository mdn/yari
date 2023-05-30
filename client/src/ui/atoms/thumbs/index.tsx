import { useState } from "react";
import { THUMBS } from "../../../telemetry/constants";
import { useGleanClick } from "../../../telemetry/glean-context";
import { Button } from "../button";

import "./index.scss";

export function GleanThumbs({
  extraClasses = "",
  feature,
}: {
  extraClasses?: string;
  feature: string;
}) {
  const [submitted, setSubmitted] = useState(false);
  const gleanClick = useGleanClick();

  const handleThumbs = (value: "up" | "down") => {
    gleanClick(`${THUMBS}: ${feature} -> ${value}`);
    setSubmitted(true);
  };

  return (
    <>
      {submitted ? (
        <section className={`glean-thumbs ${extraClasses}`}>
          <span className="thanks">Thanks for voting!</span>
        </section>
      ) : (
        <Thumbs
          extraClasses={`${extraClasses}`}
          onThumbsUp={() => handleThumbs("up")}
          onThumbsDown={() => handleThumbs("down")}
        />
      )}
    </>
  );
}

export function Thumbs({
  extraClasses = "",
  onThumbsUp,
  onThumbsDown,
}: {
  extraClasses?: string;
  onThumbsUp: React.MouseEventHandler;
  onThumbsDown: React.MouseEventHandler;
}) {
  return (
    <section className={`thumbs-up-down ${extraClasses}`}>
      <Button type="action" icon="thumbs-up" onClickHandler={onThumbsUp}>
        <span className="visually-hidden">Thumbs up</span>
      </Button>
      <Button type="action" icon="thumbs-down" onClickHandler={onThumbsDown}>
        <span className="visually-hidden">Thumbs down</span>
      </Button>
    </section>
  );
}
