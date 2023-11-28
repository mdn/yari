export interface AIHelpLog {
  chat_id: string;
  messages: AIHelpLogMessage[];
}

export interface AIHelpLogMessage {
  metadata: AIHelpMeta;
  user: ChatCompletionRequestMessage;
  assistant?: ChatCompletionRequestMessage;
}

export interface AIHelpMeta {
  type: MetaType;
  chat_id: string;
  message_id: string;
  parent_id?: string;
  sources: RefDoc[];
  quota?: AIHelpLimit;
  created_at: string;
}

export enum MetaType {
  Metadata = "metadata",
}

export interface RefDoc {
  url: string;
  title: string;
}

export interface AIHelpLimit {
  count: number;
  remaining: number;
  limit: number;
}

export interface ChatCompletionRequestMessage {
  role: "user" | "assistant";
  content: string;
}
