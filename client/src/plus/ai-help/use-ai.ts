// Source: https://github.com/supabase/supabase/blob/0f1254252f6b066e088a40617f239744e3a1e22b/packages/ui/src/components/Command/AiCommand.tsx
// License: Apache 2.0 - https://github.com/supabase/supabase/blob/0f1254252f6b066e088a40617f239744e3a1e22b/LICENSE
import type { OpenAI } from "openai";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { SSE } from "sse.js";
import useSWR, { mutate } from "swr";
import { AIHelpLog } from "./rust-types";
import { useGleanClick } from "../../telemetry/glean-context";
import { AI_HELP } from "../../telemetry/constants";
import { useAIHelpSettings } from "./utils";
import { EVENT_TIMEOUT } from "./constants";
import { AI_HELP_QUOTA_PATH } from "../common/api";

const RETRY_INTERVAL = 10000;
const ERROR_TIMEOUT = 60000;

export enum MessageRole {
  User = "user",
  Assistant = "assistant",
}

export enum MessageStatus {
  Pending = "pending",
  InProgress = "in-progress",
  Complete = "complete",
  Stopped = "stopped",
  Errored = "errored",
}

export interface Message {
  role: MessageRole;
  content: string;
  status: MessageStatus;
  sources?: PageReference[];
  chatId?: string;
  messageId?: string;
  parentId?: string | null;
}

interface NewMessageAction {
  type: "new";
  parentId?: string | null;
  chatId?: string;
  request: Message;
  response: Message;
}

interface UpdateMessageAction {
  type: "update";
  messageId?;
  message: Partial<Message>;
}

interface AppendContentAction {
  type: "append-content";
  messageId?;
  content: string;
}

interface SetMetadataAction {
  type: "set-metadata";
  sources: PageReference[];
  messageId: string;
  chatId: string;
  parentId?: string | null;
}

interface ResetAction {
  type: "reset";
}

interface SetStateAction {
  type: "set-state";
  treeState: MessageTreeState;
}

type MessageAction =
  | NewMessageAction
  | UpdateMessageAction
  | AppendContentAction
  | ResetAction
  | SetMetadataAction
  | SetStateAction;

interface PageReference {
  url: string;
  title: string;
}

export interface Quota {
  used: number;
  remaining: number;
  limit: number;
}

export interface MessageTreeNode {
  messageId?: string;
  parentId?: string | null;
  request: Message;
  response: Message;
  children: MessageTreeNode[];
}

export interface MessageTreeState {
  root: MessageTreeNode[];
  nodes: Record<string, MessageTreeNode>;
  currentNode?: MessageTreeNode;
}

export function stateToMessagePath(
  state: MessageTreeState,
  path: number[],
  traverseWithDefault: boolean = false
): Message[] {
  const [current = traverseWithDefault ? 0 : null, ...tail] = path || [];
  if (!state.root.length || current === null) {
    return [];
  }
  return messagePath(state.root[current], tail, traverseWithDefault);
}

function messagePath(
  node: MessageTreeNode,
  path: number[],
  traverseWithDefault: boolean = false
): Message[] {
  const [current = traverseWithDefault ? 0 : null, ...tail] = path;
  if (!node) {
    return [];
  }
  if (!node.children.length || current === null) {
    return [node.request, node.response];
  }
  return [
    node.request,
    node.response,
    ...messagePath(node.children[current], tail, traverseWithDefault),
  ];
}

function addSibling(state: MessageTreeState, messageId?: string) {
  if (!messageId || !state.nodes[messageId].parentId) {
    return [state.root.length];
  }
  const pId: string = state.nodes[messageId].parentId as string;
  const index = state.nodes[pId].children.length;
  const path = findPath(state, pId);
  path.push(index);
  return path;
}

function findPath(state: MessageTreeState, messageId: string) {
  let id: string | undefined | null = messageId;
  let node = state.nodes[id];
  let pId: string | undefined | null = node.parentId;
  const path: number[] = [];
  let limit = Object.keys(state.nodes).length;
  let iteration = 0;
  const sameId = (c: MessageTreeNode): boolean => {
    return c.messageId === id;
  };
  while (iteration < limit) {
    iteration++;
    const isRoot = typeof pId !== "string";
    let siblings = isRoot ? state.root : state.nodes[pId as string]?.children;
    let index = siblings?.findIndex(sameId) ?? -1;
    if (index < 0) {
      return [];
    }
    path.push(index);
    if (isRoot) {
      break;
    }
    id = pId;
    pId = state.nodes[pId as string].parentId;
  }
  return path.reverse();
}

function messageReducer(state: MessageTreeState, messageAction: MessageAction) {
  let newState = structuredClone(state);
  const { type } = messageAction;

  switch (type) {
    case "new": {
      const { response, request, parentId } = messageAction;
      const parent = parentId && newState.nodes[parentId];
      const node: MessageTreeNode = {
        parentId,
        request,
        response,
        children: [],
      };
      if (parent) {
        parent.children.push(node);
      } else {
        newState.root.push(node);
      }
      newState.currentNode = node;
      break;
    }
    case "update": {
      const { message } = messageAction;
      const messageId = newState.currentNode?.messageId;
      if (messageId) {
        newState.nodes[messageId].response = {
          ...newState.nodes[messageId].response,
          ...message,
        };
      }
      break;
    }
    case "append-content": {
      const { content } = messageAction;
      const messageId = newState.currentNode?.messageId;
      if (messageId) {
        newState.nodes[messageId].response = {
          ...newState.nodes[messageId].response,
          content: newState.nodes[messageId].response.content + content,
        };
      }
      break;
    }
    case "set-metadata": {
      const { sources, messageId, parentId, chatId } = messageAction;
      if (newState.currentNode) {
        Object.assign(newState.currentNode, {
          messageId,
          parentId,
          response: {
            ...newState.currentNode.response,
            messageId,
            parentId,
            chatId,
            sources,
          },
          request: {
            ...newState.currentNode.request,
            messageId,
            parentId,
            chatId,
          },
        });
        newState.nodes[messageId] = newState.currentNode;
      }
      break;
    }
    case "set-state": {
      const { treeState } = messageAction;
      newState = treeState;
      break;
    }
    case "reset": {
      newState = {
        root: [],
        nodes: {},
      };
      break;
    }
    default: {
      throw new Error(`Unknown message action '${type}'`);
    }
  }

  return newState;
}

interface Storage {
  treeState?: MessageTreeState;
  chatId?: string;
}

export function apiDataToStorage(data: AIHelpLog, chatId: string): Storage {
  const root: MessageTreeNode[] = [];
  const nodes = {};
  for (const message of data.messages || []) {
    const node = {
      messageId: message.metadata.message_id,
      parentId: message.metadata.parent_id,
      request: {
        role: MessageRole.User,
        content: message.user.content,
        status: MessageStatus.Complete,
        chatId: message.metadata.chat_id,
        messageId: message.metadata.message_id,
        parentId: message.metadata.parent_id,
      },
      response: {
        role: MessageRole.Assistant,
        content: message.assistant?.content || "",
        status: message.assistant
          ? MessageStatus.Complete
          : Date.now() - Date.parse(message.metadata.created_at) > ERROR_TIMEOUT
            ? MessageStatus.Errored
            : MessageStatus.InProgress,
        sources: message.metadata.sources,
        chatId: message.metadata.chat_id,
        messageId: message.metadata.message_id,
        parentId: message.metadata.parent_id,
      },
      children: [],
    };
    if (!message.metadata.parent_id) {
      root.push(node);
    } else {
      nodes[message.metadata.parent_id].children.push(node);
    }
    nodes[node.messageId] = node;
  }
  const storage = {
    chatId,
    treeState: {
      root,
      nodes,
    },
  };
  return storage;
}

class AiHelpHistory {
  static async getMessages(chatId): Promise<Storage> {
    const res = await fetch(`/api/v1/plus/ai/help/history/${chatId}`);
    if (!res.ok) {
      throw new Error(`${res.status}: ${res.statusText}`);
    }
    const data = (await res.json()) as AIHelpLog;
    if (!data.chat_id) {
      throw new Error("no chat id");
    }
    // messages are ordered ascending.
    const storage = apiDataToStorage(data, chatId);
    return storage;
  }
}

export interface UseAiChatOptions {
  messageTemplate?: (message: string) => string;
}

export function useAiChat({
  messageTemplate = (message) => message,
}: UseAiChatOptions = {}) {
  const gleanClick = useGleanClick();
  const eventSourceRef = useRef<SSE>();

  const [searchParams, setSearchParams] = useSearchParams();
  const [loadingState, setLoadingState] = useState<
    "idle" | "loading" | "responding" | "finished" | "failed"
  >("idle");
  const { isHistoryEnabled } = useAIHelpSettings();
  const isLoading = loadingState === "loading";
  const isResponding = loadingState === "responding";
  const hasError = loadingState === "failed";
  const isFinished = loadingState === "finished";

  const [isInitializing, setIsInitializing] = useState(true);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [lastEvent, setLastEvent] = useState<Date>();
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [datas, dispatchData] = useReducer(
    (state: any[], value: any) => (value === null ? [] : [...state, value]),
    []
  );

  const [chatId, setChatId] = useState<string | undefined>();
  const [previousChatId, setPreviousChatId] = useState<string | undefined>();
  const [messageId, setMessageId] = useState<string | undefined>();
  const [path, setPath] = useState<number[]>([]);
  const [state, dispatchState] = useReducer(messageReducer, undefined, () => {
    return {
      root: [],
      nodes: {},
    };
  });
  const [messages, setMessages] = useState<Message[]>([]);

  const [quota, setQuota] = useState<Quota | null | undefined>(undefined);
  const remoteQuota = useRemoteQuota();
  const flushSources = useRef<() => void>();

  const handleError = useCallback(
    (err: any) => {
      gleanClick(`${AI_HELP}: error`);
      eventSourceRef.current?.close();
      eventSourceRef.current = undefined;
      setLoadingState("failed");
      mutate(AI_HELP_QUOTA_PATH);
      console.error(err);
    },
    [gleanClick]
  );

  const reset = useCallback(() => {
    setPreviousChatId(chatId);
    setChatId(undefined);
    resetLoadingState();
    setSearchParams((prev) => {
      prev.delete("c");
      prev.delete("d");
      return prev;
    });
    setPath([]);
    setMessages([]);
    dispatchState({
      type: "reset",
    });
  }, [setSearchParams, chatId]);

  useEffect(() => {
    if (!isHistoryEnabled) {
      return;
    }
    let timeoutID;
    const convId = searchParams.get("c");
    if (convId && convId !== chatId) {
      setIsHistoryLoading(true);
      let updateHistory = () => {};
      updateHistory = async () => {
        resetLoadingState();
        const currentConvId = searchParams.get("c");
        if (!currentConvId || currentConvId !== convId) {
          return window.clearTimeout(timeoutID);
        }
        try {
          const { treeState } = await AiHelpHistory.getMessages(convId);
          if (treeState) {
            window.clearTimeout(timeoutID);
            if (
              Object.values(treeState.nodes).some(
                (node) => node.response.status === MessageStatus.InProgress
              )
            ) {
              setLoadingState("responding");
              timeoutID = window.setTimeout(
                () => updateHistory(),
                RETRY_INTERVAL
              );
            } else {
              setLoadingState("finished");
            }
            setPreviousChatId(undefined);
            setChatId(convId);
            setPath([]);
            dispatchState({
              type: "set-state",
              treeState,
            });
          } else {
            throw new Error("no treeState");
          }
        } catch (e) {
          setPreviousChatId(undefined);
          setChatId(convId);
          setPath([]);
          dispatchState({
            type: "reset",
          });
          handleError(e);
        }
        setIsHistoryLoading(false);
      };
      updateHistory();
    }
    const r = searchParams.get("d") === "1";
    if (r) {
      reset();
    }
  }, [isHistoryEnabled, searchParams, chatId, reset, handleError]);

  useEffect(() => {
    if (remoteQuota !== undefined) {
      setQuota(remoteQuota);
    }
  }, [remoteQuota]);

  useEffect(() => {
    if (loadingState !== "responding") {
      return;
    }

    // Assume we have a timeout if we receive no event in some time.
    const timeoutID = window.setTimeout(() => {
      gleanClick(`${AI_HELP}: timeout`);
      handleError("AI Help response timed out.");
    }, EVENT_TIMEOUT);

    return () => window.clearTimeout(timeoutID);
  }, [lastEvent, loadingState, handleError, gleanClick]);

  const handleEventData = useCallback(
    (data: any) => {
      try {
        setLastEvent(new Date());
        dispatchData(data);

        if (data.type === "metadata") {
          const {
            sources = undefined,
            quota = undefined,
            chat_id,
            message_id,
            parent_id,
          } = data;
          setPreviousChatId(undefined);
          setChatId(chat_id);
          setMessageId(message_id);
          setLastUpdate(new Date());
          // Sources.
          if (Array.isArray(sources)) {
            function setSources(sources) {
              dispatchState({
                type: "set-metadata",
                sources: sources,
                chatId: chat_id,
                messageId: message_id,
                parentId: parent_id,
              });
            }

            // Add sources one by one.
            let delay = 0;
            const timeouts: number[] = [];
            sources.forEach((_, index) => {
              const handler = () => setSources(sources.slice(0, index + 1));

              if (index === 0) {
                // Add first source immediately.
                handler();
              } else {
                // Delay other sources randomly for 250-1000ms.
                delay += 250 + 750 * Math.random();

                const timeout = window.setTimeout(handler, delay);
                timeouts.push(timeout);
              }
            });

            flushSources.current = () => {
              timeouts.forEach((timer) => window.clearTimeout(timer));
              setSources(sources);
              flushSources.current = undefined;
            };
          }
          // Quota.
          if (typeof quota !== "undefined") {
            setQuota(quota);
          }
          return;
        }

        setLoadingState("responding");

        flushSources.current?.();

        dispatchState({
          type: "update",
          messageId,
          message: {
            status: MessageStatus.InProgress,
          },
        });

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
          dispatchState({
            type: "append-content",
            messageId,
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

          setLoadingState("finished");
          setLastUpdate(new Date());
          dispatchState({
            type: "update",
            messageId,
            message: {
              status,
            },
          });
        }
      } catch (err) {
        handleError(err);
      }
    },
    [handleError, messageId]
  );

  const submit = useCallback(
    (
      query: string,
      chatId?: string,
      parentId?: string | null,
      messageId?: string
    ) => {
      let newPath = messageId
        ? addSibling(state, messageId)
        : parentId
          ? [...findPath(state, parentId), 0]
          : [0];
      setPath(newPath);
      gleanClick(`${AI_HELP}: submit question ${newPath.length}`);
      dispatchState({
        type: "new",
        chatId,
        parentId,
        request: {
          status: MessageStatus.Complete,
          role: MessageRole.User,
          content: query,
          chatId,
          parentId,
        },
        response: {
          status: MessageStatus.Pending,
          role: MessageRole.Assistant,
          content: "",
          chatId,
          parentId,
        },
      });
      setLoadingState("loading");

      // We send all completed in the conversation + the question the user asked.
      // Unless history is false, then we only send the query.
      // Note that `dispatchMessage()` above does not change `messages` here yet.
      const completeMessagesAndUserQuery = stateToMessagePath(
        state,
        newPath.slice(0, -1)
      )
        .filter(({ status }) => status === MessageStatus.Complete)
        .map(({ role, content }) => ({ role, content }))
        .concat({
          role: MessageRole.User,
          content: messageTemplate(query),
        });

      const eventSource = new SSE(`/api/v1/plus/ai/help`, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
        payload: JSON.stringify({
          messages: completeMessagesAndUserQuery,
          chat_id: chatId,
          parent_id: parentId,
        }),
      });

      eventSource.addEventListener("error", handleError);
      eventSource.addEventListener("message", (e: any) => {
        const data = JSON.parse(e.data);

        handleEventData(data);
      });

      eventSource.stream();

      eventSourceRef.current = eventSource;
    },
    [state, gleanClick, messageTemplate, handleError, handleEventData]
  );

  useEffect(() => {
    const messages = stateToMessagePath(state, path, true);
    setMessages(messages);
    if (messages.length) {
      setIsInitializing(false);
    }
  }, [state, path, setMessages]);

  function useRemoteQuota() {
    const { data } = useSWR<Quota>(AI_HELP_QUOTA_PATH, async (url) => {
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
    setLoadingState("idle");
    dispatchData(null);
  }

  function stop() {
    resetLoadingState();
    dispatchState({
      type: "update",
      message: {
        status: MessageStatus.Stopped,
      },
    });
  }

  const unReset = useCallback(() => {
    if (previousChatId) {
      setSearchParams((old) => {
        const params = new URLSearchParams(old);
        params.set("c", previousChatId);
        return params;
      });
    }
  }, [setSearchParams, previousChatId]);

  const nextPrev = useCallback(
    (messageId: string, dir: "next" | "prev") => {
      const node = state.nodes[messageId];
      const siblings = node.parentId
        ? state.nodes[node.parentId].children
        : state.root;
      const index = siblings.findIndex((c) => c.messageId === messageId);
      if (dir === "next" && index < siblings.length - 1) {
        return setPath(
          findPath(state, siblings[index + 1].messageId || messageId)
        );
      }
      if (dir === "prev" && index > 0) {
        return setPath(
          findPath(state, siblings[index - 1].messageId || messageId)
        );
      }
    },
    [state]
  );

  const siblingCount = useCallback(
    (messageId: string): { pos: number; total: number } => {
      if (!messageId) {
        return { pos: 1, total: 1 };
      }
      const node = state.nodes[messageId];
      if (!node) {
        return { pos: 1, total: 1 };
      }
      const siblings = node.parentId
        ? state.nodes[node.parentId].children
        : state.root;
      const index = siblings.findIndex((c) => c.messageId === messageId);
      return { pos: index + 1, total: siblings.length };
    },
    [state]
  );

  return {
    submit,
    datas,
    stop,
    reset,
    unReset,
    messages,
    state,
    path,
    isFinished,
    isLoading,
    isHistoryLoading,
    isResponding,
    isInitializing,
    hasError,
    quota,
    chatId,
    previousChatId,
    nextPrev,
    siblingCount,
    lastUpdate,
  };
}
