// Source: https://github.com/supabase/supabase/blob/0f1254252f6b066e088a40617f239744e3a1e22b/packages/ui/src/components/Command/AiCommand.tsx
// License: Apache 2.0 - https://github.com/supabase/supabase/blob/0f1254252f6b066e088a40617f239744e3a1e22b/LICENSE
import type { OpenAI } from "openai";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";

import { SSE } from "sse.js";
import useSWR from "swr";

export enum MessageRole {
  User = "user",
  Assistant = "assistant",
}

export enum MessageStatus {
  Pending = "pending",
  InProgress = "in-progress",
  Complete = "complete",
  Stopped = "stopped",
}

export interface Message {
  role: MessageRole;
  content: string;
  status: MessageStatus;
  sources?: PageReference[];
}

interface NewMessageAction {
  type: "new";
  message: Message;
}

interface UpdateMessageAction {
  type: "update";
  message: Partial<Message>;
}

interface AppendContentAction {
  type: "append-content";
  content: string;
}

interface SetSourcesAction {
  type: "set-sources";
  sources: PageReference[];
}

interface ResetAction {
  type: "reset";
}

type MessageAction =
  | NewMessageAction
  | UpdateMessageAction
  | AppendContentAction
  | ResetAction
  | SetSourcesAction;

interface PageReference {
  url: string;
  slug: string;
  title: string;
}

export interface Quota {
  used: number;
  remaining: number;
  limit: number;
}

function messageReducer(state: Message[], messageAction: MessageAction) {
  let newState = [...state];
  const { type } = messageAction;

  const index = state.length - 1;

  switch (type) {
    case "new": {
      const { message } = messageAction;
      newState.push(message);
      break;
    }
    case "update": {
      const { message } = messageAction;
      newState[index] = {
        ...state[index],
        ...message,
      };
      break;
    }
    case "append-content": {
      const { content } = messageAction;
      newState[index] = {
        ...state[index],
        content: state[index].content + content,
      };
      break;
    }
    case "set-sources": {
      const { sources } = messageAction;
      newState[index] = {
        ...state[index],
        sources,
      };
      break;
    }
    case "reset": {
      newState = [];
      break;
    }
    default: {
      throw new Error(`Unknown message action '${type}'`);
    }
  }

  return newState;
}

interface Storage {
  messages?: Message[];
}

class AiHelpStorage {
  static KEY = "ai-help";

  private static get value(): Storage {
    return JSON.parse(window.localStorage.getItem(this.KEY) ?? "{}");
  }

  private static mutate(partial: Partial<Storage>) {
    window.localStorage.setItem(
      this.KEY,
      JSON.stringify({
        ...this.value,
        ...partial,
      })
    );
  }

  static getMessages(): Message[] {
    return this.value?.messages ?? [];
  }

  static setMessages(messages: Message[]) {
    this.mutate({ messages });
  }
}

export interface UseAiChatOptions {
  messageTemplate?: (message: string) => string;
}

export function useAiChat({
  messageTemplate = (message) => message,
}: UseAiChatOptions = {}) {
  const eventSourceRef = useRef<SSE>();

  const [isLoading, setIsLoading] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [datas, dispatchData] = useReducer(
    (state: any[], value: any) => (value === null ? [] : [...state, value]),
    []
  );

  const [messages, dispatchMessage] = useReducer(
    messageReducer,
    undefined,
    () => AiHelpStorage.getMessages()
  );

  const [quota, setQuota] = useState<Quota | null | undefined>(undefined);
  const remoteQuota = useRemoteQuota();

  useEffect(() => {
    if (!isLoading && !isResponding && messages.length > 0) {
      AiHelpStorage.setMessages(messages);
    }
  }, [isLoading, isResponding, messages]);

  useEffect(() => {
    if (remoteQuota !== undefined) {
      setQuota(remoteQuota);
    }
  }, [remoteQuota]);

  const handleError = useCallback((err: any) => {
    setIsLoading(false);
    setIsResponding(false);
    setHasError(true);
    console.error(err);
  }, []);

  const handleEventData = useCallback(
    (data: any) => {
      try {
        dispatchData(data);
        setIsLoading(false);

        dispatchMessage({
          type: "update",
          message: {
            status: MessageStatus.InProgress,
          },
        });

        setIsResponding(true);

        if (data.type === "metadata") {
          const { sources = undefined, quota = undefined } = data;
          // Sources.
          if (Array.isArray(sources)) {
            dispatchMessage({
              type: "set-sources",
              sources: sources,
            });
          }
          // Quota.
          if (typeof quota !== "undefined") {
            setQuota(quota);
          }
          return;
        }

        if (!data.id) {
          console.warn("Received unsupported message", { data });
          return;
        }

        const completionResponse: OpenAI.Chat.ChatCompletionChunk = data;
        const [
          {
            delta: { content },
            finish_reason,
          },
        ] = completionResponse.choices;

        if (content) {
          dispatchMessage({
            type: "append-content",
            content,
          });
        }

        if (finish_reason) {
          if (finish_reason !== "stop") {
            // See: https://platform.openai.com/docs/guides/gpt/chat-completions-response-format
            // - length (most likely) -> token limit exceeded,
            // - function_call -> not applicable to our use case,
            // - content_filter -> content flagged and omitted
            console.warn("Got unexpected finish_reason", { finish_reason });
          }
          const status =
            finish_reason === "stop"
              ? MessageStatus.Complete
              : MessageStatus.Stopped;
          setIsResponding(false);
          dispatchMessage({
            type: "update",
            message: {
              status,
            },
          });
        }
      } catch (err) {
        handleError(err);
      }
    },
    [handleError]
  );

  const submit = useCallback(
    (query: string) => {
      dispatchMessage({
        type: "new",
        message: {
          status: MessageStatus.Complete,
          role: MessageRole.User,
          content: query,
        },
      });
      dispatchMessage({
        type: "new",
        message: {
          status: MessageStatus.Pending,
          role: MessageRole.Assistant,
          content: "",
        },
      });
      setIsResponding(false);
      setHasError(false);
      setIsLoading(true);

      // We send all completed in the conversation + the question the user asked.
      // Note that `dispatchMessage()` above does not change `messages` here yet.
      const completeMessagesAndUserQuery = messages
        .filter(({ status }) => status === MessageStatus.Complete)
        .map(({ role, content }) => ({ role, content }))
        .concat({
          role: MessageRole.User,
          content: messageTemplate(query),
        });

      const eventSource = new SSE(`/api/v1/plus/ai/ask`, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
        payload: JSON.stringify({
          messages: completeMessagesAndUserQuery,
        }),
      });

      eventSource.addEventListener("error", handleError);
      eventSource.addEventListener("message", (e: any) => {
        const data = JSON.parse(e.data);

        handleEventData(data);
      });

      eventSource.stream();

      eventSourceRef.current = eventSource;

      setIsLoading(true);
    },
    [messages, messageTemplate, handleError, handleEventData]
  );

  function useRemoteQuota() {
    const { data } = useSWR<Quota>("/api/v1/plus/ai/ask/quota", async (url) => {
      const response = await fetch(url);
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`${response.status} on ${url}: ${text}`);
      }
      const data = await response.json();
      return data.quota;
    });

    return data;
  }

  function resetLoadingState() {
    eventSourceRef.current?.close();
    eventSourceRef.current = undefined;
    setIsLoading(false);
    setIsResponding(false);
    setHasError(false);
    dispatchData(null);
  }

  function stop() {
    resetLoadingState();
    dispatchMessage({
      type: "update",
      message: {
        status: MessageStatus.Stopped,
      },
    });
  }

  function reset() {
    resetLoadingState();
    dispatchMessage({
      type: "reset",
    });
  }

  return {
    submit,
    datas,
    stop,
    reset,
    messages,
    isLoading,
    isResponding,
    hasError,
    quota,
  };
}
