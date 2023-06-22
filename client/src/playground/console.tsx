export interface VConsole {
  prop: string;
  message: string;
}

export function Console({ vConsole }: { vConsole: VConsole[] }) {
  return (
    <div id="play-console">
      <span>Console</span>
      <ul>
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
