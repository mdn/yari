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

  return <>{text}</>;
}

function displayString(date: Date) {
  const currentTime = new Date().getTime();
  const targetTime = date.getTime();
  const diffSecs = Math.round((currentTime - targetTime) / 1000);

  if (diffSecs < 0) {
    return formatDateTime(date);
  }

  if (diffSecs < 60) {
    return diffSecs === 1 ? `Just now` : `${diffSecs} seconds ago`;
  }
  if (diffSecs < 60 * 60) {
    const minutes = Math.floor(diffSecs / 60);
    return minutes === 1 ? `A minute ago` : `${minutes} minutes ago`;
  }
  if (diffSecs < 60 * 60 * 24) {
    const hours = Math.floor(diffSecs / 3600);
    return hours === 1 ? `An hour ago` : `${hours} hours ago`;
  }
  // up to 30 days as days
  if (diffSecs < 60 * 60 * 24 * 30) {
    const days = Math.floor(diffSecs / 86400);
    return days === 1 ? `Yesterday` : `${days} days ago`;
  }

  // after a week, return the formatted date
  return formatDateTime(date);
}
