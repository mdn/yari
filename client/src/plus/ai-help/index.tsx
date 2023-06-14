import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { useAiChat } from "./use-ai";
import { AiLoginBanner, AiUpsellBanner } from "./login-banner";
import { useUserData } from "../../user-context";
import Container from "../../ui/atoms/container";
import { FeatureId, MDN_PLUS_TITLE } from "../../constants";
import { useLocale, useScrollToTop, useViewedState } from "../../hooks";
import { Icon } from "../../ui/atoms/icon";
import Mandala from "../../ui/molecules/mandala";

import "./index.scss";
import { Avatar } from "../../ui/atoms/avatar";
import { isPlusSubscriber } from "../../utils";
import { Button } from "../../ui/atoms/button";
import { GleanThumbs } from "../../ui/atoms/thumbs";
import NoteCard from "../../ui/molecules/notecards";
import { Loading } from "../../ui/atoms/loading";

const QUESTIONS: string[] = [
  "How to center a div with CSS?",
  "How do I create a form in HTML?",
  "How can I access the clipboard in JavaScript?",
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
              <Icon name="chatgpt" />
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

const SORRY_BACKEND = "Sorry, I don't know how to help with that.";
const SORRY_FRONTEND =
  "Sorry, I don’t know how to help with that.\n\nPlease keep in mind that I am only limited to answer based on the MDN documentation.";

export function AIHelpInner() {
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const user = useUserData();
  const locale = useLocale();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { isResponding, hasError, messages, quota, reset, submit } = useAiChat({
    setIsLoading,
  });

  const isQuotaExceeded = quota && quota.remaining <= 0;

  return typeof quota === "undefined" ? (
    <Loading />
  ) : (
    <section
      className={["ai-help-inner", query.trim() && "has-input"]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="ai-help-body">
        <>
          {messages.length ? (
            <ul className="ai-help-messages">
              {messages.map((message, index) => (
                <li
                  key={index}
                  className={`ai-help-message ai-help-message-${message.role}`}
                >
                  <div className="ai-help-message-role">
                    <RoleIcon role={message.role} />
                  </div>
                  <div
                    className={[
                      "ai-help-message-content",
                      message.status,
                      !message.content && "empty",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {message.role === "user" ? (
                      message.content
                    ) : (
                      <>
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          linkTarget="_blank"
                        >
                          {message.content.replace(
                            SORRY_BACKEND,
                            SORRY_FRONTEND
                          )}
                        </ReactMarkdown>
                        {message.status === "complete" &&
                          !message.content.includes(SORRY_BACKEND) && (
                            <>
                              {message.sources && (
                                <>
                                  <p>
                                    Articles that I've consulted that you might
                                    want to check:
                                  </p>
                                  <ul>
                                    {message.sources.map(
                                      ({ slug, title }, index) => (
                                        <li key={index}>
                                          <a href={`/${locale}/${slug}`}>
                                            {title}
                                          </a>
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </>
                              )}
                              <GleanThumbs
                                feature="ai-help-answer"
                                question={"Is this answer useful?"}
                                upLabel={"Yes, this answer is useful."}
                                downLabel={"No, this answer is not useful."}
                                permanent={true}
                              />
                            </>
                          )}
                      </>
                    )}
                  </div>
                  {index === 0 && (
                    <div className="ai-help-actions">
                      <Button
                        type="action"
                        extraClasses="ai-help-button-reset"
                        onClickHandler={(event) => {
                          setQuery("");
                          reset();
                          window.scrollTo(0, 0);
                        }}
                      >
                        + New chat
                      </Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            !isQuotaExceeded && (
              <section className="ai-help-examples">
                {QUESTIONS.map((question, index) => (
                  <button
                    key={index}
                    type="button"
                    className="ai-help-example"
                    onClick={() => submit(question)}
                  >
                    <span className="ai-help-example-icon">⚡️</span>{" "}
                    <span className="ai-help-example-text">{question}</span>
                  </button>
                ))}
              </section>
            )
          )}
        </>
      </div>
      {hasError && (
        <NoteCard extraClasses="ai-help-error" type="error">
          <h4>Error</h4>
          <p>An error occurred. Please try again.</p>
        </NoteCard>
      )}
      <div className="ai-help-footer">
        {isQuotaExceeded ? (
          <AiUpsellBanner />
        ) : (
          <>
            <form
              ref={formRef}
              className="ai-help-input"
              onSubmit={(event) => {
                event.preventDefault();
                if (query.trim()) {
                  submit(query.trim());
                  setQuery("");
                }
              }}
            >
              <input
                ref={inputRef}
                disabled={isLoading || isResponding}
                type="text"
                onChange={(event) => setQuery(event.target.value)}
                value={query}
                placeholder={
                  isLoading
                    ? "Loading..."
                    : isResponding
                    ? "Receiving..."
                    : isPlusSubscriber(user)
                    ? "Ask your question (unlimited questions per day)."
                    : quota
                    ? `Ask your question (${quota.remaining} questions remaining today)`
                    : "Ask your question (up to 5 questions per day)."
                }
              />
              <Button
                type="action"
                icon="send"
                buttonType="submit"
                title="Submit question"
                isDisabled={!query}
                extraClasses="send-ai-message-button"
              >
                <span className="visually-hidden">Submit question</span>
              </Button>
            </form>
            <div className="ai-help-footer-text">
              <span>
                Results based on MDN's most recent documentation and powered by
                OpenAI GPT 3.5
              </span>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export function RoleIcon({ role }: { role: "user" | "assistant" }) {
  const userData = useUserData();

  switch (role) {
    case "user":
      return <Avatar userData={userData} />;

    case "assistant":
      return <Icon name="chatgpt" />;
  }
}
