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
  const getHeader = () => {
    const element = document.getElementById(id);
    return element?.parentElement?.parentElement;
  };
  const setActive = (value: boolean) => {
    const header = getHeader();
    if (header instanceof HTMLElement) {
      header.classList.toggle("active", value);
    }
  };
  const intoView = () => {
    const header = getHeader();
    const top =
      (header?.getBoundingClientRect().top || 0) + window.scrollY - 130;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <li
      key={key}
      onMouseOver={() => setActive(true)}
      onMouseOut={() => setActive(false)}
    >
      <button className="queue-ref" onClick={intoView}>
        Example {key + 1}
      </button>
      <code>{lang}</code>
      <Button
        type="action"
        buttonType="reset"
        icon="trash"
        onClickHandler={() => unqueue()}
      />
    </li>
  );
}

export function PlayQueue({ standalone = false }: { standalone?: boolean }) {
  const locale = useLocale();
  const isServer = useIsServer();
  const { queue, setQueue } = useUIStatus();

  const cb = useCallback(() => {
    // Sync checkboxes to queue state.
    const elements = getQueueCheckboxes();
    setQueue(
      elements
        .filter((e) => e.checked)
        .map((e) => createQueueEntry(e, elements))
    );
  }, [setQueue]);

  useEffect(() => {
    // Sync queue state to checkboxes.
    const ids = queue.map((item) => item.id);
    const elements = [
      ...document.querySelectorAll(".playlist > input:checked"),
    ] as HTMLInputElement[];
    for (const element of elements) {
      element.checked = ids.includes(element.id);
    }
  }, [queue]);

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
          </summary>
          <div className="play-queue-inner">
            <ul>
              {queue.map((item) => (
                <PQEntry
                  key={item.key}
                  item={item}
                  unqueue={() =>
                    setQueue((old) => old.filter((x) => x.id !== item.id))
                  }
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

function getQueueCheckboxes() {
  return [
    ...document.querySelectorAll(".playlist > input"),
  ] as HTMLInputElement[];
}

const LANG_MAPPING = {
  javascript: "js",
};

export function createQueueEntry(
  elementOrId: HTMLInputElement | string,
  elements?: HTMLInputElement[]
) {
  const e =
    elementOrId instanceof HTMLInputElement
      ? elementOrId
      : (document.getElementById(elementOrId) as HTMLInputElement);
  elements ??= getQueueCheckboxes();

  const key = elements.indexOf(e);
  const id = e.id;
  const lang =
    e
      ?.closest(".example-header")
      ?.querySelector(".language-name")
      ?.textContent?.toLowerCase() ?? "";

  return { key, id, lang: LANG_MAPPING[lang] ?? lang };
}
