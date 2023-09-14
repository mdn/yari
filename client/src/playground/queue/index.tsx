import { useEffect, useRef, useState } from "react";
import "./index.scss";
import { collectCode } from "../../document/code/playground";
import { SESSION_KEY } from "../utils";
import { useLocale } from "../../hooks";
import { Button } from "../../ui/atoms/button";

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
      <button className="queue-ref" onClick={intoView}>
        Example {key + 1}
      </button>
      <code>{lang}</code>
      <button className="queue-delete" onClick={() => element.click()}>
        x
      </button>
    </li>
  );
}

export function PlayQueue({ standalone = false }: { standalone?: boolean }) {
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
    <div className={`play-queue-container ${standalone ? "standalone" : ""}`}>
      <aside className="play-queue">
        <ul>
          {queue.map((el, key) =>
            PQEntry({ element: el as HTMLInputElement, key })
          )}
        </ul>
        <Button
          type="secondary"
          extraClasses="play-button"
          onClickHandler={() => {
            const code = collectCode();
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(code));
            const url = new URL(window?.location.href);
            url.pathname = `/${locale}/play`;
            url.hash = "";
            url.search = "";
            window.location.href = url.href;
          }}
        >
          PLAY
        </Button>
      </aside>
    </div>
  ) : null;
}
