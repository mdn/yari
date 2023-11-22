import { useCallback, useEffect } from "react";
import "./index.scss";
import { collectCode } from "../../document/code/playground";
import { SESSION_KEY } from "../utils";
import { useIsServer, useLocale } from "../../hooks";
import { Button } from "../../ui/atoms/button";
import { useUIStatus } from "../../ui-context";
import { QueueEntry } from "../../types/playground";

function PQEntry({
  item: { id, key, lang },
  unqueue,
}: {
  item: QueueEntry;
  unqueue: () => void;
}) {
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
        onClickHandler={() => unqueue()}
      />
    </li>
  );
}

const LANG_MAPPING = {
  javascript: "js",
};

export function PlayQueue({ standalone = false }: { standalone?: boolean }) {
  const locale = useLocale();
  const isServer = useIsServer();
  const { queue, setQueue, setQueuedExamples } = useUIStatus();
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
                setQueuedExamples(() => new Set());
                setQueue([]);
              }}
            ></Button>
          </summary>
          <div className="play-queue-inner">
            <ul>
              {queue.map((item) => (
                <PQEntry
                  key={item.key}
                  item={item}
                  unqueue={() => {
                    setQueuedExamples(
                      (old) => new Set([...old].filter((x) => x !== item.id))
                    );
                    setQueue((old) => old.filter((x) => x.id !== item.id));
                  }}
                />
              ))}
            </ul>
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
