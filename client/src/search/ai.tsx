import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { useAiChat } from "./use-ai";
import "./ai.scss";
import { Button } from "../ui/atoms/button";
import { useUIStatus } from "../ui-context";

const questions: string[] = [
  "What pages can you recommend to learn web development?",
  "How to migrate a table layout to grid?",
  "What are some tips to make my site accessible?",
  "How can I apply functional programming with JavaScript?",
  "What are some techniques to improve web performance?",
  "How can I read and write to the clipboard?",
  "What does it mean if a web feature is baseline?",
  "How can I contribute to MDN?",
];

export function AIDialogInner() {
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { isResponding, hasError, messages, submit } = useAiChat({
    setIsLoading,
  });
  const { setIsDialogOpen } = useUIStatus();

  return (
    <section className="search-ai">
      <div className="search-ai-header">
        <div className="search-ai-header-left">
          <span className="search-ai-header-icon">🤖</span>{" "}
          <span className="search-ai-header-title">Ask MDN</span>
        </div>
        <div className="search-ai-header-right">
          <Button
            type="action"
            icon="cancel"
            onClickHandler={() => setIsDialogOpen(false)}
          >
            <span className="visually-hidden">Close dialog</span>
          </Button>
        </div>
      </div>
      <div className="search-ai-body">
        {hasError && (
          <section className="search-ai-error">An error occurred.</section>
        )}
        {messages.length ? (
          <ul className="search-ai-messages">
            {messages.map((message, index) => (
              <li
                className={`search-ai-message search-ai-message-${message.role}`}
              >
                <div className="search-ai-message-role">
                  <RoleIcon role={message.role} />
                </div>
                <div className="search-ai-message-content">
                  {message.role === "user" ? (
                    message.content
                  ) : (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      linkTarget="_blank"
                    >
                      {message.content}
                    </ReactMarkdown>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <section className="search-ai-examples">
            {questions.map((question) => (
              <button
                type="button"
                className="search-ai-example"
                onClick={() => submit(question)}
              >
                <span className="search-ai-example-icon">⚡️</span>{" "}
                <span className="search-ai-example-text">{question}</span>
              </button>
            ))}
          </section>
        )}
      </div>
      <div className="search-ai-footer">
        <form
          ref={formRef}
          onSubmit={(event) => {
            event.preventDefault();
            const query = inputRef.current?.value;
            if (query) {
              submit(query);
              formRef.current?.reset();
            }
          }}
        >
          <input
            ref={inputRef}
            disabled={isLoading || isResponding}
            type="text"
            placeholder={
              isLoading
                ? "Waiting for an answer..."
                : isResponding
                ? "Receiving answer..."
                : "Ask MDN a question..."
            }
          />
        </form>
      </div>
    </section>
  );
}

export function RoleIcon({ role }: { role: "user" | "assistant" }) {
  switch (role) {
    case "user":
      return <>👤</>;

    case "assistant":
      return <>🤖</>;
  }
}
