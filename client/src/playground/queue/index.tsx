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
        icon="trash-filled"
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

const LANG_MAPPING = {
  javascript: "js",
};

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
        const { id } = e;
        const lang =
          e
            ?.closest(".example-header")
            ?.querySelector(".language-name")
            ?.textContent?.toLowerCase() ?? "";
        return { key, id, lang: LANG_MAPPING[lang] ?? lang };
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
