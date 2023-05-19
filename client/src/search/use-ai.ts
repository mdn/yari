// Source: https://github.com/supabase/supabase/blob/0f1254252f6b066e088a40617f239744e3a1e22b/packages/ui/src/components/Command/AiCommand.tsx
// License: Apache 2.0 - https://github.com/supabase/supabase/blob/0f1254252f6b066e088a40617f239744e3a1e22b/LICENSE
import type {
  ChatCompletionResponseMessage,
  CreateChatCompletionResponse,
  CreateChatCompletionResponseChoicesInner,
} from "openai";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useReducer,
  useRef,
  useState,
} from "react";

import { SSE } from "sse.js";

const SUPABASE_URL = "https://xguihxuzqibwxjnimxev.supabase.co/";
const SUPABASE_API_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhndWloeHV6cWlid3hqbmlteGV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzUwOTQ4MzUsImV4cCI6MTk5MDY3MDgzNX0.0PMlOxtKL4O9GGZuAP_Xl4f-Tut1qOnW4bNEmAtoB8w";

type CreateChatCompletionResponseChoicesInnerDelta = Omit<
  CreateChatCompletionResponseChoicesInner,
  "message"
> & {
  delta: Partial<ChatCompletionResponseMessage>;
};

function getEdgeFunctionUrl() {
  const supabaseUrl = SUPABASE_URL?.replace(/\/$/, "");

  if (!supabaseUrl) {
    return undefined;
  }

  // https://github.com/supabase/supabase-js/blob/10d3423506cbd56345f7f6ab2ec2093c8db629d4/src/SupabaseClient.ts#L96
  const isPlatform = supabaseUrl.match(/(supabase\.co)|(supabase\.in)/);

  if (isPlatform) {
    const [schemeAndProjectId, domain, tld] = supabaseUrl.split(".");
    return `${schemeAndProjectId}.functions.${domain}.${tld}`;
  } else {
    return `${supabaseUrl}/functions/v1`;
  }
}

const edgeFunctionUrl = getEdgeFunctionUrl();

export enum MessageRole {
  User = "user",
  Assistant = "assistant",
}

export enum MessageStatus {
  Pending = "pending",
  InProgress = "in-progress",
  Complete = "complete",
}

export interface Message {
  role: MessageRole;
  content: string;
  status: MessageStatus;
}

interface NewMessageAction {
  type: "new";
  message: Message;
}

interface UpdateMessageAction {
  type: "update";
  index: number;
  message: Partial<Message>;
}

interface AppendContentAction {
  type: "append-content";
  index: number;
  content: string;
}

interface ResetAction {
  type: "reset";
}

type MessageAction =
  | NewMessageAction
  | UpdateMessageAction
  | AppendContentAction
  | ResetAction;

function messageReducer(state: Message[], messageAction: MessageAction) {
  let current = [...state];
  const { type } = messageAction;

  switch (type) {
    case "new": {
      const { message } = messageAction;
      current.push(message);
      break;
    }
    case "update": {
      const { index, message } = messageAction;
      if (current[index]) {
        Object.assign(current[index], message);
      }
      break;
    }
    case "append-content": {
      const { index, content } = messageAction;
      if (current[index]) {
        current[index].content += content;
      }
      break;
    }
    case "reset": {
      current = [];
      break;
    }
    default: {
      throw new Error(`Unknown message action '${type}'`);
    }
  }

  return current;
}

export interface UseAiChatOptions {
  messageTemplate?: (message: string) => string;
  setIsLoading?: Dispatch<SetStateAction<boolean>>;
}

export function useAiChat({
  messageTemplate = (message) => message,
  setIsLoading,
}: UseAiChatOptions) {
  const eventSourceRef = useRef<SSE>();

  const [isResponding, setIsResponding] = useState(false);
  const [hasError, setHasError] = useState(false);

  const [currentMessageIndex, setCurrentMessageIndex] = useState(1);
  const [messages, dispatchMessage] = useReducer(messageReducer, []);

  const submit = useCallback(
    async (query: string) => {
      if (!edgeFunctionUrl) return console.error("No edge function url");

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
      setIsLoading?.(true);

      const eventSource = new SSE(`${edgeFunctionUrl}/ai-docs`, {
        headers: {
          apikey: SUPABASE_API_KEY,
          Authorization: `Bearer ${SUPABASE_API_KEY}`,
          "Content-Type": "application/json",
        },
        payload: JSON.stringify({
          messages: messages
            .filter(({ status }) => status === MessageStatus.Complete)
            .map(({ role, content }) => ({ role, content }))
            .concat({
              role: MessageRole.User,
              content: messageTemplate(query),
            }),
        }),
      });

      function handleError<T>(err: T) {
        setIsLoading?.(false);
        setIsResponding(false);
        setHasError(true);
        console.error(err);
      }

      eventSource.addEventListener("error", handleError);
      eventSource.addEventListener("message", (e) => {
        try {
          setIsLoading?.(false);

          if (e.data === "[DONE]") {
            setIsResponding(false);
            dispatchMessage({
              type: "update",
              index: currentMessageIndex,
              message: {
                status: MessageStatus.Complete,
              },
            });
            setCurrentMessageIndex((x) => x + 2);
            return;
          }

          dispatchMessage({
            type: "update",
            index: currentMessageIndex,
            message: {
              status: MessageStatus.InProgress,
            },
          });

          setIsResponding(true);

          const completionResponse: CreateChatCompletionResponse = JSON.parse(
            e.data
          );
          const [
            {
              delta: { content },
            },
          ] =
            completionResponse.choices as CreateChatCompletionResponseChoicesInnerDelta[];

          if (content) {
            dispatchMessage({
              type: "append-content",
              index: currentMessageIndex,
              content,
            });
          }
        } catch (err) {
          handleError(err);
        }
      });

      eventSource.stream();

      eventSourceRef.current = eventSource;

      setIsLoading?.(true);
    },
    [currentMessageIndex, messages, messageTemplate]
  );

  function reset() {
    eventSourceRef.current?.close();
    eventSourceRef.current = undefined;
    setIsResponding(false);
    setHasError(false);
    dispatchMessage({
      type: "reset",
    });
  }

  return {
    submit,
    reset,
    messages,
    isResponding,
    hasError,
  };
}
