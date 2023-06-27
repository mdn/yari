import { MutableRefObject, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Quota, useAiChat } from "./use-ai";
import { AiLoginBanner, AiUpsellBanner } from "./login-banner";
import { useUserData } from "../../user-context";
import Container from "../../ui/atoms/container";
import { FeatureId, MDN_PLUS_TITLE } from "../../constants";
import { useScrollToTop, useViewedState } from "../../hooks";
import { Icon } from "../../ui/atoms/icon";
import Mandala from "../../ui/molecules/mandala";

import "./index.scss";
import { Avatar } from "../../ui/atoms/avatar";
import { Button } from "../../ui/atoms/button";
import { GleanThumbs } from "../../ui/atoms/thumbs";
import NoteCard from "../../ui/molecules/notecards";
import { Loading } from "../../ui/atoms/loading";
import { useLocation } from "react-router-dom";
import { isExternalUrl } from "./utils";
import { useGleanClick } from "../../telemetry/glean-context";
import { AI_HELP } from "../../telemetry/constants";

type Category = "apis" | "css" | "html" | "http" | "js" | "learn";

const EXAMPLES: { category: Category; query: string }[] = [
  {
    category: "css",
    query: "How to center a div with CSS?",
  },
  {
    category: "html",
    query: "How do I create a form in HTML?",
  },
  {
    category: "js",
    query: "How can I sort an Array in JavaScript?",
  },
  {
    category: "apis",
    query: "How can I use the Fetch API to make HTTP requests in JavaScript?",
  },
  {
    category: "http",
    query: "How can I redirect using HTTP?",
  },
  {
    category: "learn",
    query: "What are some accessibility best practices?",
  },
];

export default function AiHelp() {
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
              href="https://survey.alchemer.com/s3/7405739/MDN-AI-Help"
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
        {user?.isAuthenticated ? <AIHelpInner /> : <AiLoginBanner />}
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
  const bodyRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [isExample, setIsExample] = useState(false);
  const { hash } = useLocation();
  const gleanClick = useGleanClick();

  const {
    isLoading,
    isResponding,
    hasError,
    datas,
    messages,
    quota,
    reset,
    stop,
    submit,
  } = useAiChat();

  const isQuotaLoading = quota === undefined;
  const hasQuota = !isQuotaLoading && quota !== null;
  const hasConversation = messages.length > 0;

  function isQuotaExceeded(quota: Quota | null | undefined): quota is Quota {
    return quota ? quota.remaining <= 0 : false;
  }

  function placeholder(status: string) {
    if (!hasQuota) {
      return status;
    }

    return `${status} (${quota.remaining} ${
      quota.remaining === 1 ? "question" : "questions"
    } remaining today)`;
  }

  const { autoScroll, setAutoScroll } = useAutoScroll(messages, {
    bodyRef,
    footerRef,
  });

  useEffect(() => {
    // Focus input:
    // - When the user loads the page (-> isQuotaLoading).
    // - When the user starts a "New chat" (-> hasConversation).
    const input = inputRef.current;
    if (input) {
      window.setTimeout(() => input.focus());
    }
  }, [isQuotaLoading, hasConversation]);

  return isQuotaLoading ? (
    <Loading />
  ) : (
    <section
      className={["ai-help-inner", query.trim() && "has-input"]
        .filter(Boolean)
        .join(" ")}
    >
      {hasConversation && (
        <div ref={bodyRef} className="ai-help-body">
          <ul className="ai-help-messages">
            {messages.map((message, index) => (
              <li
                key={index}
                className={[
                  "ai-help-message",
                  `role-${message.role}`,
                  `status-${message.status}`,
                ].join(" ")}
              >
                <div className="ai-help-message-role">
                  <RoleIcon role={message.role} />
                </div>
                <div
                  className={[
                    "ai-help-message-content",
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
                        components={{
                          a: ({ node, ...props }) => {
                            if (isExternalUrl(props.href ?? "")) {
                              props = {
                                ...props,
                                className: "external",
                                rel: "noopener noreferrer",
                                target: "_blank",
                              };
                            }
                            // eslint-disable-next-line jsx-a11y/anchor-has-content
                            return <a {...props} />;
                          },
                        }}
                      >
                        {message.content.replace(SORRY_BACKEND, SORRY_FRONTEND)}
                      </ReactMarkdown>
                      {message.status === "complete" &&
                        !message.content.includes(SORRY_BACKEND) && (
                          <>
                            {message.sources && message.sources.length > 0 && (
                              <>
                                <p>
                                  MDN content that I've consulted that you might
                                  want to check:
                                </p>
                                <ul>
                                  {message.sources.map(
                                    ({ url, title }, index) => (
                                      <li key={index}>
                                        <a href={url}>{title}</a>
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
                      isDisabled={isQuotaExceeded(quota)}
                      extraClasses="ai-help-reset-button"
                      onClickHandler={() => {
                        gleanClick(`${AI_HELP}: reset`);
                        setQuery("");
                        setIsExample(false);
                        reset();
                        window.setTimeout(() => window.scrollTo(0, 0));
                      }}
                    >
                      + New chat
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      {hasError && (
        <NoteCard extraClasses="ai-help-error" type="error">
          <h4>Error</h4>
          <p>An error occurred. Please try again.</p>
        </NoteCard>
      )}
      <div ref={footerRef} className="ai-help-footer">
        {(isLoading || isResponding) && (
          <div className="ai-help-footer-actions">
            <Button
              type="action"
              extraClasses="ai-help-stop-button"
              onClickHandler={() => {
                gleanClick(`${AI_HELP}: stop`);
                stop();
              }}
            >
              ⏹ Stop answering
            </Button>
            <Button
              type="action"
              isDisabled={autoScroll}
              extraClasses="ai-help-scroll-button"
              onClickHandler={() => setAutoScroll(true)}
            >
              ↓ Enable auto-scroll
            </Button>
          </div>
        )}
        {isQuotaExceeded(quota) ? (
          <AiUpsellBanner limit={quota.limit} />
        ) : (
          <>
            <form
              ref={formRef}
              className="ai-help-input-form"
              onSubmit={(event) => {
                event.preventDefault();
                gleanClick(
                  `${AI_HELP}: submit ${isExample ? "example" : "question"}`
                );
                if (query.trim()) {
                  submit(query.trim());
                  setQuery("");
                  setIsExample(false);
                  setAutoScroll(true);
                }
              }}
            >
              <input
                ref={inputRef}
                disabled={isLoading || isResponding}
                type="text"
                onChange={(event) => {
                  setQuery(event.target.value);
                  setIsExample(false);
                }}
                value={query}
                placeholder={placeholder(
                  isLoading
                    ? "Requesting answer..."
                    : isResponding
                    ? "Receiving answer..."
                    : "Ask your question"
                )}
              />
              <Button
                type="action"
                icon="send"
                buttonType="submit"
                title="Submit question"
                isDisabled={!query}
              >
                <span className="visually-hidden">Submit question</span>
              </Button>
            </form>
            <div className="ai-help-footer-text">
              <span>
                Results based on MDN's most recent documentation and powered by
                OpenAI GPT-3.5
              </span>
            </div>
          </>
        )}
      </div>
      {!hasConversation && !query && !isQuotaExceeded(quota) && (
        <section className="ai-help-examples">
          <header>Examples</header>
          {EXAMPLES.map(({ category, query }, index) => (
            <button
              key={index}
              type="button"
              className={["ai-help-example", `category-${category}`].join(" ")}
              onClick={() => {
                gleanClick(`${AI_HELP}: example`);
                setQuery(query);
                setIsExample(true);
                inputRef.current?.focus();
                window.setTimeout(() => window.scrollTo(0, 0));
              }}
            >
              {query}
            </button>
          ))}
        </section>
      )}
      {hash === "#debug" && <pre>{JSON.stringify(datas, null, 2)}</pre>}
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

function useAutoScroll(
  dependency,
  {
    bodyRef,
    footerRef,
  }: {
    bodyRef: MutableRefObject<HTMLElement | null>;
    footerRef: MutableRefObject<HTMLElement | null>;
  }
) {
  const [autoScroll, setAutoScroll] = useState(true);
  const lastScrollY = useRef(0);
  const lastHeight = useRef(0);

  useEffect(() => {
    const body = (bodyRef.current ??=
      document.querySelector<HTMLElement>(".ai-help-body"));
    const footer = (footerRef.current ??=
      document.querySelector<HTMLElement>(".ai-help-footer"));

    if (!body || !footer) {
      return;
    }

    window.setTimeout(() => {
      const { offsetTop, offsetHeight } = body;
      const elementBottom = offsetTop + offsetHeight + footer.offsetHeight;
      const targetScrollY = elementBottom - window.innerHeight;

      // Only scroll if our element grew and the target scroll position is further down.
      const shouldScroll =
        lastHeight.current < offsetHeight &&
        lastScrollY.current < targetScrollY;

      lastHeight.current = offsetHeight;
      lastScrollY.current = window.scrollY;

      if (autoScroll && shouldScroll) {
        window.scrollTo(0, targetScrollY);
      }
    });

    const scrollListener = () => {
      const { offsetTop, offsetHeight } = body;
      const { innerHeight, scrollY } = window;
      const elementBottom = offsetTop + offsetHeight + footer.offsetHeight;
      const windowBottom = scrollY + innerHeight;
      const isBottomVisible =
        scrollY <= elementBottom && elementBottom <= windowBottom;

      const scrollOffset = scrollY - lastScrollY.current;
      if (autoScroll && scrollOffset < 0 && !isBottomVisible) {
        // User scrolled up.
        setAutoScroll(false);
      } else if (!autoScroll && scrollOffset > 0 && isBottomVisible) {
        // User scrolled down again.
        setAutoScroll(true);
      }
      lastScrollY.current = scrollY;
    };
    window.addEventListener("scroll", scrollListener);

    return () => window.removeEventListener("scroll", scrollListener);
  }, [autoScroll, bodyRef, dependency, footerRef]);

  return {
    autoScroll,
    setAutoScroll,
  };
}
