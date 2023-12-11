import useSWR, { KeyedMutator } from "swr";
import { Button } from "../../ui/atoms/button";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import "./history.scss";
import { useLocale } from "../../hooks";
import { HighlightedIcon } from "../../ui/atoms/icon";
import { useAIHelpSettings } from "./utils";
import { useGleanClick } from "../../telemetry/glean-context";
import { AI_HELP } from "../../telemetry/constants";

const DEFAULT_TOPIC_LABEL = "New Topic";

function monthYearLabel(date: Date): string {
  const formattedDate = date.toLocaleString(undefined, {
    month: "short",
    year: "numeric",
  });
  return formattedDate;
}

interface HistoryEntry {
  chat_id: string;
  label: string;
  last: string;
}
interface HistoryEntries {
  label: string;
  entries: HistoryEntry[];
}

function groupHistory(history) {
  const now = new Date();
  const today = new Date(now.toDateString());
  const yesterday = new Date(
    structuredClone(today).setDate(today.getDate() - 1)
  );
  const last7Days = new Date(
    structuredClone(today).setDate(today.getDate() - 7)
  );
  const last30Days = new Date(
    structuredClone(today).setDate(today.getDate() - 30)
  );
  const groups = [
    { label: "Last 30 Days", d: last30Days },
    { label: "Last 7 Days", d: last7Days },
    { label: "Yesterday", d: yesterday },
    { label: "Today", d: today },
  ];
  const grouped: HistoryEntries[] = [];

  let { label = "unknown", d } = groups.pop() || {};
  let current: HistoryEntries = { label, entries: [] };
  for (const entry of history) {
    let last = new Date(entry.last);
    while (!d || last < d) {
      if (!d) {
        label = monthYearLabel(last);
        break;
      } else if (last < d) {
        ({ label = "unknown", d } = groups.pop() || {});
        continue;
      }
      break;
    }
    if (current.label !== label) {
      grouped.push(current);
      current = { label, entries: [entry] };
    } else {
      current.entries.push(entry);
    }
  }

  if (current.entries.length) {
    grouped.push(current);
  }
  return grouped;
}

function AIHelpHistorySubList({
  currentChatId,
  entries,
  mutate,
}: {
  currentChatId?: string;
  entries: HistoryEntries;
  mutate: KeyedMutator<any[]>;
}) {
  const [, setSearchParams] = useSearchParams();
  const gleanClick = useGleanClick();

  return (
    <>
      <time>{entries.label}</time>
      <ol>
        {entries.entries.map(({ chat_id, last, label }, index) => {
          return (
            <li
              key={index}
              className={`${
                chat_id === currentChatId ? "ai-help-history-active" : ""
              }`}
            >
              <a
                href={`./ai-help?c=${chat_id}`}
                title={label || DEFAULT_TOPIC_LABEL}
                onClick={(e) => {
                  e.preventDefault();
                  gleanClick(`${AI_HELP}: history item -> ${chat_id}`);
                  setSearchParams((old) => {
                    const params = new URLSearchParams(old);
                    params.set("c", chat_id);
                    return params;
                  });
                }}
              >
                {label || DEFAULT_TOPIC_LABEL}
              </a>
              {chat_id === currentChatId && (
                <Button
                  type="action"
                  icon="trash"
                  onClickHandler={async () => {
                    const confirmed = window.confirm(
                      "Do you want to permanently delete this Topic?"
                    );
                    gleanClick(
                      `${AI_HELP}: history delete -> ${Number(confirmed)}`
                    );
                    if (confirmed) {
                      await fetch(`/api/v1/plus/ai/help/history/${chat_id}`, {
                        method: "DELETE",
                      });
                      mutate();
                      setSearchParams((old) => {
                        const params = new URLSearchParams(old);
                        params.delete("c");
                        params.append("d", "1");
                        return params;
                      });
                    }
                  }}
                />
              )}
            </li>
          );
        })}
      </ol>
    </>
  );
}

export function AIHelpHistory(props: HistoryProps) {
  const { isHistoryEnabled } = useAIHelpSettings();

  return (
    <aside className="ai-help-history" tabIndex={-1}>
      {isHistoryEnabled ? (
        <AIHelpHistoryInner {...props} />
      ) : (
        <AIHelpHistoryActivation />
      )}
    </aside>
  );
}

interface HistoryProps {
  currentChatId?: string;
  lastUpdate: Date;
  isFinished: boolean;
  messageId?: string;
}

export function AIHelpHistoryInner({
  currentChatId,
  lastUpdate,
  isFinished,
  messageId,
}: HistoryProps) {
  const gleanClick = useGleanClick();
  const { data, mutate } = useSWR(
    `/api/v1/plus/ai/help/history/list`,
    async (url) => {
      const res = await (await fetch(url)).json();
      return Array.isArray(res) ? res : [];
    },
    {
      fallbackData: [],
    }
  );

  const { label: currentChatLabel = "" } =
    data.find((chat) => chat.chat_id === currentChatId) ?? {};

  useEffect(() => {
    if (isFinished && messageId && currentChatLabel === "") {
      const update = async () => {
        const res = await fetch(
          `/api/v1/plus/ai/help/history/summary/${messageId}`,
          {
            method: "POST",
          }
        );
        if (res.ok) {
          await res.json();
          mutate();
        }
      };
      update();
    }
  }, [mutate, isFinished, currentChatId, messageId, currentChatLabel]);

  useEffect(() => {
    mutate();
  }, [lastUpdate, mutate]);

  return (
    <>
      <input
        id="ai-help-history-toggle"
        onChange={(event) => gleanClick(`${AI_HELP}: history toggle`)}
        type="checkbox"
        className="ai-help-history-details"
      />
      <div className="ai-help-history-toggle">
        <label
          className="button action has-icon"
          htmlFor="ai-help-history-toggle"
        >
          <span className="button-wrap">
            <span className="icon icon-sidebar "></span>
            <span className="visually-hidden">toggle history menu</span>
          </span>
        </label>
      </div>
      <ol>
        {groupHistory(data).map((entries, index) => {
          return entries?.entries.length ? (
            <li key={index}>
              <AIHelpHistorySubList
                entries={entries}
                currentChatId={currentChatId}
                mutate={mutate}
              />
            </li>
          ) : null;
        })}
      </ol>
    </>
  );
}

export function AIHelpHistoryActivation() {
  const locale = useLocale();
  const gleanClick = useGleanClick();

  return (
    <section className="ai-help-history-activation">
      <figure>
        <HighlightedIcon name="history" />
        <figcaption>
          <p>
            <strong>Answer History</strong>
          </p>
          <p>
            <span className="teaser">
              You can now effortlessly revisit and continue past conversations
            </span>
          </p>
          <p>
            <Button
              type="link"
              href={`/${locale}/plus/settings#ai-help--history-enable`}
              onClickHandler={() => gleanClick(`${AI_HELP}: history enable`)}
            >
              Enable History
            </Button>
          </p>
        </figcaption>
      </figure>
    </section>
  );
}
