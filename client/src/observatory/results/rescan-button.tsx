import { useEffect, useState } from "react";

import { useGleanClick } from "../../telemetry/glean-context";
import { OBSERVATORY } from "../../telemetry/constants";
import { Button } from "../../ui/atoms/button";

export function RescanButton({
  from,
  duration,
  onClickHandler,
}: {
  from: Date;
  duration: number;
  onClickHandler: () => void;
}) {
  function calculateRemainingTime() {
    const endTime = from.getTime() + duration * 1000;
    return Math.max(0, endTime - new Date().getTime());
  }
  const [remainingTime, setRemainingTime] = useState(() =>
    calculateRemainingTime()
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingTime(calculateRemainingTime());
    }, 1000);

    return () => clearInterval(interval);
  });

  const gleanClick = useGleanClick();

  function rescan() {
    gleanClick(`${OBSERVATORY}: rescan`);
    onClickHandler();
  }

  const isExpired = remainingTime <= 0;
  const remainingSecs = Math.floor(remainingTime / 1000) + 1;
  const progressPercent = (remainingSecs * 100) / 60;
  return !isExpired ? (
    <Button isDisabled={true}>
      <div
        className="progress"
        role="progressbar"
        aria-labelledby="wait-secs"
        style={{
          background: `conic-gradient(var(--button-color) 0grad, ${progressPercent}%, rgba(0,0,0,0) ${progressPercent}% 100%)`,
        }}
      ></div>
      <small id="wait-secs">Wait {remainingSecs}s to rescan</small>
    </Button>
  ) : (
    <Button onClickHandler={rescan}>Rescan</Button>
  );
}
