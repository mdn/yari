import useSWR, { KeyedMutator } from "swr";
import { Button } from "../../ui/atoms/button";
import { useEffect } from "react";

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
  const last30Days = new Date(
    structuredClone(today).setDate(today.getDate() - 30)
  );
  const groups = [
    { label: "Last 30 Days", d: last30Days },
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
              <a href={`./ai-help?c=${chat_id}`} title={last}>
                {label || "New Topic"}
              </a>
              {chat_id === currentChatId && (
                <Button
                  type="action"
                  icon="trash"
                  onClickHandler={async () => {
                    if (
                      window.confirm(
                        "Do you want to permanently delete this Topic?"
                      )
                    ) {
                      await fetch(`/api/v1/plus/ai/help/history/${chat_id}`, {
                        method: "DELETE",
                      });
                      mutate();
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

export function AIHelpHistory({
  currentChatId,
  lastUpdate,
  isResponding,
  messageId,
}: {
  currentChatId?: string;
  lastUpdate: Date;
  isResponding: boolean;
  messageId?: string;
}) {
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

  const firstTopic = data[0];

  useEffect(() => {
    if (
      !isResponding &&
      messageId &&
      firstTopic?.chat_id === currentChatId &&
      firstTopic?.label === ""
    ) {
      const update = async () => {
        await (
          await fetch(`/api/v1/plus/ai/help/history/summary/${messageId}`, {
            method: "POST",
          })
        ).json();
        mutate();
      };
      update();
    }
  }, [mutate, isResponding, currentChatId, messageId, firstTopic]);
  useEffect(() => {
    mutate();
  }, [lastUpdate, mutate]);

  return (
    <aside className="ai-help-history">
      <input
        id="ai-help-history-toggle"
        type="checkbox"
        className="ai-help-history-details"
      />
      <label htmlFor="ai-help-history-toggle">
        <span className="visually-hidden">toggle history menu</span>
      </label>
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
    </aside>
  );
}
