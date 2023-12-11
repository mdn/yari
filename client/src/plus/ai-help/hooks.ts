import { useEffect, useRef, useState } from "react";

export function useDelayedArray<T>(
  value: T[] | undefined,
  minDelay: number,
  randomDelay: number = 0
): T[] | undefined {
  const [delayedArray, setValue] = useState<T[]>();
  const last = useRef<T[]>();

  useEffect(() => {
    const current = value;

    if (current?.length === last.current?.length) {
      return;
    }

    last.current = current;

    if (!current) {
      setValue(current);
      return;
    }

    let delay = 0;

    const timers = current.map((_, index) => {
      const handler = () => setValue(current.slice(0, index));
      delay += minDelay + randomDelay * Math.random();
      return window.setTimeout(handler, delay);
    });

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      setValue(current);
    };
  }, [value, minDelay, randomDelay, setValue]);

  return delayedArray;
}
