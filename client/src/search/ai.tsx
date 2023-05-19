import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { useAiChat } from "./use-ai";
import "./ai.scss";

const questions: string[] = [
  "How do I get started with Supabase?",
  "How do I run Supabase locally?",
  "How do I connect to my database?",
  "How do I run migrations? ",
  "How do I listen to changes in a table?",
  "How do I set up authentication?",
];

export function AIDialogInner() {
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { isResponding, hasError, messages, submit } = useAiChat({
    setIsLoading,
  });

  return (
    <section className="search-ai">
      <div className="search-ai-header">
        <span className="search-ai-header-icon">🤖</span>{" "}
        <span className="search-ai-header-title">Ask MDN</span>
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
              isLoading || isResponding
                ? "Waiting for an answer..."
                : "Ask MDN AI a question..."
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
