import { useEffect, useRef, useState } from "react";

export function useDelayedArray<T>(
  value: T[] | undefined,
  minDelay: number,
  randomDelay: number = 0
): T[] | undefined {
  const [result, setResult] = useState<T[]>();
  const last = useRef<T[]>();

  useEffect(() => {
    const current = value;

    if (current?.length === last.current?.length) {
      return;
    }

    last.current = current;

    if (!current) {
      setResult(current);
      return;
    }

    let delay = 0;

    const timers = current.map((_, index) => {
      const handler = () => setResult(current.slice(0, index));
      delay += minDelay + randomDelay * Math.random();
      return window.setTimeout(handler, delay);
    });

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      setResult(current);
    };
  }, [value, minDelay, randomDelay, setResult]);

  return result;
}
