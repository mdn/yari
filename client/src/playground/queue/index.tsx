import { useCallback, useEffect, useState } from "react";
import "./index.scss";
import { collectCode } from "../../document/code/playground";
import { SESSION_KEY } from "../utils";
import { useIsServer, useLocale } from "../../hooks";
import { Button } from "../../ui/atoms/button";

function PQEntry({ id, key, lang }: QueueEntry) {
  const intoView = () => {
    const element = document.getElementById(id);
    const header = element?.parentElement?.parentElement;
    const top =
      (header?.getBoundingClientRect().top || 0) + window.scrollY - 130;
    window.scrollTo({ top, behavior: "smooth" });
  };
  return (
    <li key={key}>
      <button className="queue-ref" onClick={intoView}>
        Example {key + 1}
      </button>
      <code>{lang}</code>
      <Button
        type="action"
        buttonType="reset"
        icon="trash"
        onClickHandler={() => {
          uncheck(id);
          window["playQueue"]?.();
        }}
      />
    </li>
  );
}

function uncheck(id: string) {
  const el = document.getElementById(id) as HTMLInputElement | undefined;
  if (el) {
    el.checked = false;
    return true;
  }
  return false;
}

interface QueueEntry {
  key: number;
  id: string;
  lang?: string | null;
}

export function PlayQueue({ standalone = false }: { standalone?: boolean }) {
  const locale = useLocale();
  const isServer = useIsServer();
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const cb = useCallback(() => {
    const elements = [
      ...document.querySelectorAll(".playlist > input:checked"),
    ] as HTMLInputElement[];
    setQueue(
      elements.map((e, key) => {
        return { key, id: e.id, lang: e?.firstChild?.textContent };
      })
    );
  }, [setQueue]);
  useEffect(() => {
    if (!isServer) {
      window["playQueue"] = cb;
    }
  }, [cb, isServer]);
  return queue.length ? (
    <div className={`play-queue-container ${standalone ? "standalone" : ""}`}>
      <aside>
        <details className="play-queue" open>
          <summary>
            <div>Queue</div>
            <Button
              buttonType="reset"
              icon="cancel"
              type="action"
              onClickHandler={() => {
                queue.forEach(({ id }) => uncheck(id));
                setQueue([]);
              }}
            ></Button>
          </summary>
          <div className="play-queue-inner">
            <ul>{queue.map(PQEntry)}</ul>
            <Button
              type="secondary"
              extraClasses="play-button"
              onClickHandler={(e) => {
                const code = collectCode();
                sessionStorage.setItem(SESSION_KEY, JSON.stringify(code));
                const url = new URL(window?.location.href);
                url.pathname = `/${locale}/play`;
                url.hash = "";
                url.search = "";
                window.open(url, "_blank");
              }}
            >
              Play
            </Button>
          </div>
        </details>
      </aside>
    </div>
  ) : null;
}
