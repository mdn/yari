import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { useAiChat } from "./use-ai";
import { AiLoginBanner } from "./login-banner";
import { useUserData } from "../../user-context";
import Container from "../../ui/atoms/container";
import { FeatureId, MDN_PLUS_TITLE } from "../../constants";
import { useScrollToTop, useViewedState } from "../../hooks";
import { Icon } from "../../ui/atoms/icon";
import Mandala from "../../ui/molecules/mandala";

import "./index.scss";

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

export function AiHelp() {
  document.title = `AI Help | ${MDN_PLUS_TITLE}`;
  useScrollToTop();
  const user = useUserData();
  const { setViewed } = useViewedState();
  useEffect(() => setViewed(FeatureId.PLUS_AI_HELP));

  return (
    <div className="ai-help">
      <header className="plus-header-mandala">
        <Container>
          <h1>
            <div className="mandala-icon-wrapper">
              <Mandala rotate={true} />
              <Icon name="unknown" />
            </div>
            <span>AI Help</span>
          </h1>
          <p>
            Get answers using generative AI based on MDN content.
            <br />
            <a
              href="https://www.example.com/"
              target="_blank"
              rel="noreferrer noopener"
              className="external"
            >
              We'd love to hear your feedback!
            </a>
          </p>
        </Container>
      </header>
      <Container>
        {user && !user.isAuthenticated ? <AiLoginBanner /> : <AIHelpInner />}
      </Container>
    </div>
  );
}

export function AIHelpInner() {
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { isResponding, hasError, messages, submit } = useAiChat({
    setIsLoading,
  });

  return (
    <section className="ai-help-inner">
      <div className="ai-help-body">
        <>
          {hasError && (
            <section className="ai-help-error">An error occurred.</section>
          )}
          {messages.length ? (
            <ul className="ai-help-messages">
              {messages.map((message, index) => (
                <li
                  className={`ai-help-message ai-help-message-${message.role}`}
                >
                  <div className="ai-help-message-role">
                    <RoleIcon role={message.role} />
                  </div>
                  <div className="ai-help-message-content">
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
            <section className="ai-help-examples">
              {questions.map((question) => (
                <button
                  type="button"
                  className="ai-help-example"
                  onClick={() => submit(question)}
                >
                  <span className="ai-help-example-icon">⚡️</span>{" "}
                  <span className="ai-help-example-text">{question}</span>
                </button>
              ))}
            </section>
          )}
        </>
      </div>
      <div className="ai-help-footer">
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
                : "Ask your question."
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
