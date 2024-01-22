import { useCallback, useEffect } from "react";
import "./index.scss";
import { collectCode } from "../../document/code/playground";
import { SESSION_KEY } from "../utils";
import { useIsServer, useLocale } from "../../hooks";
import { Button } from "../../ui/atoms/button";
import { useUIStatus } from "../../ui-context";
import { QueueEntry } from "../../types/playground";
import { PLAYGROUND } from "../../telemetry/constants";
import { useGleanClick } from "../../telemetry/glean-context";

function PQEntry({
  gleanContext,
  item: { id, key, lang },
  unqueue,
}: {
  gleanContext: string;
  item: QueueEntry;
  unqueue: () => void;
}) {
  const gleanClick = useGleanClick();
  const { setHighlightedExample } = useUIStatus();
  const getHeader = () => {
    const element = document.getElementById(id);
    return element?.parentElement?.parentElement;
  };
  const setActive = (value: boolean) => {
    if (setHighlightedExample) {
      if (value) {
        setHighlightedExample(id);
      } else {
        setHighlightedExample(null);
      }
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
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
    >
      <button
        className="queue-ref"
        onClick={() => {
          gleanClick(`${gleanContext}: queue item -> ${id}`);
          intoView();
        }}
      >
        Example {key + 1}
      </button>
      <code>{lang}</code>
      <Button
        type="action"
        buttonType="reset"
        icon="trash"
        onClickHandler={() => {
          gleanClick(`${gleanContext}: queue dequeue -> ${id}`);
          unqueue();
        }}
      />
    </li>
  );
}

export function PlayQueue({
  gleanContext = PLAYGROUND,
  standalone = false,
}: {
  gleanContext?: string;
  standalone?: boolean;
}) {
  const locale = useLocale();
  const isServer = useIsServer();
  const gleanClick = useGleanClick();
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
                  gleanContext={gleanContext}
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
                gleanClick(`${gleanContext}: queue play ${queue.length}`);
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
