import { useEffect, useState } from "react";

import { formatDateTime } from "../utils";

export function HumanDuration({ date }: { date: Date }) {
  const [text, setText] = useState(() => displayString(date));

  useEffect(() => {
    const interval = setInterval(() => {
      setText(displayString(date));
    }, 1000);

    return () => clearInterval(interval);
  });

  return (
    <time dateTime={date.toISOString()} title={formatDateTime(date)}>
      {text}
    </time>
  );
}

function displayString(date: Date) {
  const currentTime = new Date().getTime();
  const targetTime = date.getTime();
  const diffSecs = Math.round((currentTime - targetTime) / 1000);
  let direction_postfix = " ago";
  let direction_prefix = "";

  if (diffSecs < 0) {
    direction_postfix = "";
    direction_prefix = "in about ";
    // return formatDateTime(date);
  }

  if (Math.abs(diffSecs) < 60) {
    return `Just now`;
  }
  if (Math.abs(diffSecs) < 60 * 60) {
    const minutes = Math.abs(Math.floor(diffSecs / 60));
    return minutes === 1
      ? `${direction_prefix}1 minute${direction_postfix}`
      : `${direction_prefix}${minutes} minutes${direction_postfix}`;
  }
  if (Math.abs(diffSecs) < 60 * 60 * 24) {
    const hours = Math.abs(Math.floor(diffSecs / 3600));
    return hours === 1
      ? `${direction_prefix}1 hour${direction_postfix}`
      : `${direction_prefix}${hours} hours${direction_postfix}`;
  }
  // up to 30 days as days
  if (Math.abs(diffSecs) < 60 * 60 * 24 * 30) {
    const days = Math.abs(Math.floor(diffSecs / 86400));
    return days === 1
      ? `${direction_prefix}1 day${direction_postfix}`
      : `${direction_prefix}${days} days${direction_postfix}`;
  }
  // up to 350 days as months
  if (Math.abs(diffSecs) < 60 * 60 * 24 * 350) {
    const months = Math.abs(Math.floor(diffSecs / 2592000));
    return months === 1
      ? `${direction_prefix}1 month${direction_postfix}`
      : `${direction_prefix}${months} months${direction_postfix}`;
  }

  // after 350 days return as years
  const years = Math.abs(Math.floor(diffSecs / 31622400));
  return years === 1
    ? `${direction_prefix}1 year${direction_postfix}`
    : `${direction_prefix}${years} years${direction_postfix}`;
}
