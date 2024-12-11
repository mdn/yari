import { useEffect, useState } from "react";
import { formatDateTime } from "../utils";

export function HumanDuration({ date }: { date: Date }) {
  const [text, setText] = useState(() => displayString(date));

  useEffect(() => {
    const interval = setInterval(() => {
      setText(displayString(date));
    }, 10000);

    return () => clearInterval(interval);
  });

  return (
    <time dateTime={date.toISOString()} title={formatDateTime(date)}>
      {text}
    </time>
  );
}

// breakpoints for humanized time durations
const MINUTE = 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;
const MONTH = DAY * 30;
const YEAR = DAY * 364;

function displayString(date: Date) {
  const currentTime = new Date().getTime();
  const targetTime = date.getTime();
  const diffSecs = Math.round((targetTime - currentTime) / 1000);

  const rtf = new Intl.RelativeTimeFormat("en", { style: "long" });
  const absSecs = Math.abs(diffSecs);

  if (absSecs < MINUTE) {
    return diffSecs < 0 ? "Just now" : "Very soon";
  } else if (absSecs < HOUR) {
    return rtf.format(Math.floor(diffSecs / MINUTE), "minute");
  } else if (absSecs < DAY) {
    return rtf.format(Math.floor(diffSecs / HOUR), "hour");
  } else if (absSecs < MONTH) {
    return rtf.format(Math.floor(diffSecs / DAY), "day");
  } else if (absSecs < YEAR) {
    return rtf.format(Math.floor(diffSecs / MONTH), "month");
  } else {
    return rtf.format(Math.floor(diffSecs / YEAR), "year");
  }
}
