import { useEffect, useRef, useState } from "react";
import "./index.scss";
import { collectCode } from "../../document/code/playground";
import { SESSION_KEY } from "../utils";
import { useLocale } from "../../hooks";

function PQEntry({ element, key }: { element: HTMLInputElement; key: number }) {
  const header = element.parentElement?.parentElement;
  const intoView = () => {
    const top =
      (header?.getBoundingClientRect().top || 0) + window.scrollY - 130;
    window.scrollTo({ top, behavior: "smooth" });
  };
  const lang = header?.firstChild?.textContent;
  return (
    <li key={key}>
      <button onClick={intoView}>#</button>
      <code>{lang}</code>
      <button onClick={() => element.click()}>x</button>
    </li>
  );
}

export function PlayQueue() {
  const locale = useLocale();
  const [queue, setQueue] = useState<Element[]>([]);
  const observer = useRef<null | MutationObserver>(null);
  useEffect(() => {
    if (observer.current === null) {
      const callback = (mutationList, observer) => {
        for (const mutation of mutationList) {
          if (mutation.type === "attributes") {
            setQueue([
              ...document.querySelectorAll(".playlist > input:checked"),
            ]);
          }
        }
      };
      const mObserver = new MutationObserver(callback);
      mObserver.observe(document.body, {
        subtree: true,
        attributeFilter: ["data-queued"],
      });
      observer.current = mObserver;
    }
  }, [setQueue]);
  return queue.length ? (
    <div className="play-queue-container">
      <aside className="play-queue">
        <ul>
          {queue.map((el, key) =>
            PQEntry({ element: el as HTMLInputElement, key })
          )}
        </ul>
        <button
          onClick={() => {
            const code = collectCode();
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(code));
            const url = new URL(window?.location.href);
            url.pathname = `/${locale}/play`;
            url.hash = "";
            url.search = "";
            window.location.href = url.href;
          }}
        >
          play
        </button>
      </aside>
    </div>
  ) : null;
}
