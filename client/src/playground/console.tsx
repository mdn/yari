import { useEffect, useRef } from "react";

export interface VConsole {
  prop: string;
  message: string;
}

export function Console({ vConsole }: { vConsole: VConsole[] }) {
  const consoleUl = useRef<HTMLUListElement | null>(null);
  const scrollToBottom = () => {
    consoleUl.current?.scrollTo({ top: consoleUl.current?.scrollHeight });
  };
  useEffect(() => {
    scrollToBottom();
  }, [vConsole]);
  return (
    <div id="play-console">
      <span>Console</span>
      <ul ref={consoleUl}>
        {vConsole.map(({ prop, message }, i) => {
          return (
            <li key={i}>
              <code>{message}</code>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
