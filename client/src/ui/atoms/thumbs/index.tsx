import { useEffect, useState } from "react";
import { THUMBS } from "../../../telemetry/constants";
import { useGleanClick } from "../../../telemetry/glean-context";
import { Button } from "../button";

import "./index.scss";

const LOCAL_STORAGE_KEY = "thumbs";

function getPreviouslySubmitted() {
  try {
    return JSON.parse(window?.localStorage?.getItem(LOCAL_STORAGE_KEY) ?? "{}");
  } catch (e) {
    console.warn("Unable to read thumbs state to localStorage", e);
    return {};
  }
}

function isPreviouslySubmitted(feature: string): boolean {
  try {
    return feature in getPreviouslySubmitted();
  } catch (e) {
    return false;
  }
}

function markPreviouslySubmitted(feature: string, value: boolean) {
  try {
    window?.localStorage?.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify({
        ...getPreviouslySubmitted(),
        [feature]: {
          submitted_at: Date.now(),
          value,
        },
      })
    );
  } catch (e) {
    console.warn("Unable to write thumbs state to localStorage", e);
  }
}

export function GleanThumbs({
  feature,
  question = "Is this feature useful?",
  confirmation = "Thank you for your feedback! ❤️",
  upLabel = "This feature is useful.",
  downLabel = "This feature is not useful.",
}: {
  feature: string;
  question?: string;
  confirmation?: string;
  upLabel?: string;
  downLabel?: string;
}) {
  const [previouslySubmitted, setPreviouslySubmitted] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const gleanClick = useGleanClick();

  useEffect(() => {
    setPreviouslySubmitted(isPreviouslySubmitted(feature));
  }, [feature, setPreviouslySubmitted]);

  const handleThumbs = (value: "up" | "down") => {
    gleanClick(`${THUMBS}: ${feature} -> ${value === "up" ? 1 : 0}`);
    setSubmitted(true);
    markPreviouslySubmitted(feature, value === "up");
  };

  return (
    <>
      {!previouslySubmitted && (
        <section className="glean-thumbs">
          {!submitted ? (
            <>
              {question && <span className="question">{question}</span>}
              <Thumbs
                upLabel={upLabel}
                downLabel={downLabel}
                onThumbsUp={() => handleThumbs("up")}
                onThumbsDown={() => handleThumbs("down")}
              />
            </>
          ) : (
            confirmation && <span className="confirmation">{confirmation}</span>
          )}
        </section>
      )}
    </>
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
