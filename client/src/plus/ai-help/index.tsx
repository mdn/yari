import Prism from "prismjs";
import {
  Children,
  MutableRefObject,
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  Message,
  MessageRole,
  MessageStatus,
  Quota,
  useAiChat,
} from "./use-ai";
import { AiHelpBanner, AiUpsellBanner } from "./banners";
import { useUserData } from "../../user-context";
import Container from "../../ui/atoms/container";
import { FeatureId, MDN_PLUS_TITLE } from "../../constants";
import { useLocale, useScrollToTop, useViewedState } from "../../hooks";
import { Icon } from "../../ui/atoms/icon";

import { collectCode } from "../../document/code/playground";
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
import MDNModal from "../../ui/atoms/modal";
import { AI_FEEDBACK_GITHUB_REPO } from "../../env";
import ExpandingTextarea from "../../ui/atoms/form/expanding-textarea";
import React from "react";
import { SESSION_KEY } from "../../playground/utils";
import { PlayQueue, createQueueEntry } from "../../playground/queue";
import { AIHelpHistory } from "./history";
import { useUIStatus } from "../../ui-context";
import { QueueEntry } from "../../types/playground";
import { AIHelpLanding } from "./landing";
import {
  SORRY_BACKEND,
  SORRY_FRONTEND,
  MESSAGE_SEARCHING,
  MESSAGE_ANSWERING,
  MESSAGE_FAILED,
  MESSAGE_ANSWERED,
  MESSAGE_SEARCHED,
} from "./constants";
import InternalLink from "../../ui/atoms/internal-link";
import { isPlusSubscriber } from "../../utils";

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
      {user?.isAuthenticated ? <AIHelpAuthenticated /> : <AIHelpLanding />}
    </div>
  );
}

function AIHelpAuthenticated() {
  const gleanClick = useGleanClick();

  return (
    <div className={`ai-help-main with-ai-help-history`}>
      <Container extraClasses="ai-help-header">
        <h1>
          <span>AI Help</span>
        </h1>
        <p>Get answers using generative AI based on MDN content.</p>
        <p>
          <a
            href="https://survey.alchemer.com/s3/7418589/MDN-AI-Help-Feedback"
            target="_blank"
            rel="noreferrer noopener"
            className="feedback-link"
            onClick={() => gleanClick(`${AI_HELP}: report feedback`)}
          >
            Report Feedback
          </a>
        </p>
      </Container>
      <AIHelpInner />
    </div>
  );
}

function AIHelpUserQuestion({
  message,
  canEdit,
  submit,
  nextPrev,
  siblingCount,
}) {
  const gleanClick = useGleanClick();
  const [editing, setEditing] = useState(false);
  const [question, setQuestion] = useState(message.content);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { pos, total } = siblingCount(message.messageId);

  useEffect(() => {
    setQuestion(message.content);
  }, [message.content]);

  return editing ? (
    <form
      className="ai-help-input-form"
      onSubmit={(event) => {
        event.preventDefault();
        if (canEdit && question?.trim()) {
          gleanClick(`${AI_HELP}: edit submit`);
          setEditing(false);
          submit(question, message.chatId, message.parentId, message.messageId);
        }
      }}
    >
      <ExpandingTextarea
        ref={inputRef}
        enterKeyHint="send"
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            if (canEdit && question?.trim()) {
              gleanClick(`${AI_HELP}: edit submit`);
              setEditing(false);
              submit(
                question,
                message.chatId,
                message.parentId,
                message.messageId
              );
            }
          }
        }}
        onChange={(e) => setQuestion(e.target.value)}
        value={question}
        rows={1}
      />
      <div className="ai-help-input-actions">
        {canEdit && (
          <>
            {question && (
              <Button
                type="action"
                icon="cancel"
                buttonType="reset"
                title="Clear question"
                onClickHandler={() => {
                  gleanClick(`${AI_HELP}: edit clear`);
                  setQuestion("");
                }}
              >
                <span className="visually-hidden">Clear question</span>
              </Button>
            )}
            <Button
              type="action"
              icon="send"
              buttonType="submit"
              title="Submit question"
              isDisabled={!question.trim()}
            >
              <span className="visually-hidden">Submit question</span>
            </Button>
          </>
        )}
        <Button
          type="action"
          icon="return"
          title="Undo editing"
          onClickHandler={() => {
            gleanClick(`${AI_HELP}: edit cancel`);
            setEditing(false);
            setQuestion(message.content);
          }}
        >
          <span className="visually-hidden">Undo editing</span>
        </Button>
      </div>
    </form>
  ) : (
    <div className="ai-help-message-content role-user">
      {total > 1 && (
        <nav className="ai-help-message-nav">
          <Button
            icon="previous"
            type="action"
            isDisabled={pos === 1}
            onClickHandler={() => {
              gleanClick(`${AI_HELP}: question prev`);
              nextPrev(message.messageId, "prev");
            }}
          >
            <span className="visually-hidden">Previous Question</span>
          </Button>
          <span>
            {pos} / {total}
          </span>
          <Button
            isDisabled={pos === total}
            icon="next"
            type="action"
            onClickHandler={() => {
              gleanClick(`${AI_HELP}: question next`);
              nextPrev(message.messageId, "next");
            }}
          >
            <span className="visually-hidden">Next Question</span>
          </Button>
        </nav>
      )}
      <div className="ai-help-user-message">{message.content}</div>
      {canEdit && (
        <Button
          type="action"
          icon="edit-filled"
          onClickHandler={() => {
            gleanClick(`${AI_HELP}: edit start`);
            setEditing(true);
          }}
        />
      )}
    </div>
  );
}

function AIHelpAssistantResponse({
  message,
  queuedExamples,
  setQueue,
  messages,
}: {
  message: Message;
  queuedExamples: Set<string>;
  setQueue: React.Dispatch<React.SetStateAction<QueueEntry[]>>;
  messages: Message[];
}) {
  const gleanClick = useGleanClick();
  const locale = useLocale();
  const { highlightedQueueExample } = useUIStatus();

  let sample = 0;

  return (
    <>
      <div
        className={[
          "ai-help-message-progress",
          message.status !== MessageStatus.Pending && "complete",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {message.status === MessageStatus.Pending
          ? MESSAGE_SEARCHING
          : MESSAGE_SEARCHED}
      </div>
      {message.sources && message.sources.length > 0 && (
        <ul className="ai-help-message-sources">
          {message.sources.map(({ url, title }, index) => (
            <li key={index}>
              <InternalLink
                to={url}
                onClick={() => gleanClick(`${AI_HELP}: link source -> ${url}`)}
                target="_blank"
              >
                {title}
              </InternalLink>
            </li>
          ))}
        </ul>
      )}
      {(message.content ||
        message.status === MessageStatus.InProgress ||
        message.status === MessageStatus.Errored) && (
        <div
          className={[
            "ai-help-message-progress",
            message.status === MessageStatus.Complete && "complete",
            message.status === MessageStatus.Errored && "errored",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {message.status === MessageStatus.Errored
            ? MESSAGE_FAILED
            : message.status === MessageStatus.InProgress
              ? MESSAGE_ANSWERING
              : MESSAGE_ANSWERED}
        </div>
      )}
      {message.content && (
        <div
          className={[
            "ai-help-message-content",
            !message.content && "empty",
            `role-${message.role}`,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              a: ({ node, ...props }) => {
                if (props.href?.startsWith("https://developer.mozilla.org/")) {
                  props.href = props.href.replace(
                    "https://developer.mozilla.org",
                    ""
                  );
                }

                const isExternal = isExternalUrl(props.href ?? "");

                if (isExternal) {
                  props.className = "external";
                  props.rel = "noopener noreferrer";
                }

                // Measure.
                props.onClick = () =>
                  gleanClick(
                    `${AI_HELP}: link ${
                      isExternal ? "external" : "internal"
                    } -> ${props.href}`
                  );

                // Always open in new tab.
                props.target = "_blank";

                // eslint-disable-next-line jsx-a11y/anchor-has-content
                return <a {...props} />;
              },
              pre: ({ node, className, children, ...props }) => {
                const code = Children.toArray(children)
                  .map(
                    (child) =>
                      /language-(\w+)/.exec(
                        (child as ReactElement)?.props?.className || ""
                      )?.[1]
                  )
                  .find(Boolean);

                if (!code) {
                  return (
                    <pre {...props} className={className}>
                      {children}
                    </pre>
                  );
                }
                const key = sample;
                const id = `${message.messageId}--${key}`;
                const isQueued = queuedExamples.has(id);
                sample += 1;
                return (
                  <div className="code-example">
                    <div
                      className={`example-header play-collect ${
                        highlightedQueueExample === id ? "active" : ""
                      }`}
                    >
                      <span className="language-name">{code}</span>
                      {message.status === MessageStatus.Complete &&
                        ["html", "js", "javascript", "css"].includes(
                          code.toLowerCase()
                        ) && (
                          <div className="playlist">
                            <input
                              type="checkbox"
                              checked={isQueued}
                              onChange={() => {
                                gleanClick(
                                  `${AI_HELP}: example ${
                                    isQueued ? "dequeue" : "queue"
                                  } -> ${id}`
                                );
                                setQueue((old) =>
                                  !old.some((item) => item.id === id)
                                    ? [...old, createQueueEntry(id)].sort(
                                        (a, b) => a.key - b.key
                                      )
                                    : [...old].filter((item) => item.id !== id)
                                );
                              }}
                              id={id}
                            />
                            <label htmlFor={id}>
                              {isQueued ? "queued" : "queue"}
                            </label>
                            <button
                              type="button"
                              className="play-button"
                              title="Open in Playground"
                              onClick={(e) => {
                                gleanClick(`${AI_HELP}: example play -> ${id}`);
                                const input = (e.target as HTMLElement)
                                  .previousElementSibling
                                  ?.previousElementSibling as HTMLInputElement;
                                const code = collectCode(input);
                                sessionStorage.setItem(
                                  SESSION_KEY,
                                  JSON.stringify(code)
                                );
                                const url = new URL(window?.location.href);
                                url.pathname = `/${locale}/play`;
                                url.hash = "";
                                url.search = "";
                                if (e.shiftKey === true) {
                                  window.location.href = url.href;
                                } else {
                                  window.open(url, "_blank");
                                }
                              }}
                            >
                              play
                            </button>
                          </div>
                        )}
                    </div>
                    <pre className={`brush: ${code}`}>{children}</pre>
                  </div>
                );
              },
              code: ({ className, children, ...props }) => {
                const match = /language-(\w+)/.exec(className || "");
                const lang = Prism.languages[match?.[1]];
                return lang ? (
                  <code
                    {...props}
                    className={className}
                    dangerouslySetInnerHTML={{
                      __html: Prism.highlight(String(children), lang),
                    }}
                  />
                ) : (
                  <code {...props} className={className}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {message.content?.replace(SORRY_BACKEND, SORRY_FRONTEND)}
          </ReactMarkdown>
          {message.status === "complete" &&
            !message.content?.includes(SORRY_BACKEND) && (
              <>
                <section className="ai-help-feedback">
                  <GleanThumbs
                    feature="ai-help-answer"
                    featureKey={message.messageId}
                    question={"Was this answer useful?"}
                    upLabel={"Yes, this answer was useful."}
                    downLabel={"No, this answer was not useful."}
                  />
                  <ReportIssueOnGitHubLink
                    messages={messages}
                    currentMessage={message}
                  >
                    Report an issue with this answer on GitHub
                  </ReportIssueOnGitHubLink>
                </section>
              </>
            )}
        </div>
      )}
    </>
  );
}

export function AIHelpInner() {
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const { queuedExamples, setQueue, setHighlightedQueueExample } =
    useUIStatus();
  const { hash } = useLocation();
  const gleanClick = useGleanClick();
  const user = useUserData();

  const {
    isFinished,
    isLoading,
    isHistoryLoading,
    isResponding,
    isInitializing,
    hasError,
    datas,
    messages,
    quota,
    reset,
    unReset,
    stop,
    submit,
    chatId,
    previousChatId,
    nextPrev,
    siblingCount,
    lastUpdate,
  } = useAiChat();

  const isQuotaLoading = quota === undefined;
  const hasQuota = !isQuotaLoading && quota !== null;
  const hasConversation = messages.length > 0;
  const gptVersion = isPlusSubscriber(user) ? "GPT-4" : "GPT-3.5";

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
    // Do not focus while we figure out wether we're loading history (-> isInitializing).
    const input = inputRef.current;
    if (input && !isInitializing && !hasConversation) {
      window.setTimeout(() => input.focus());
    }
  }, [isQuotaLoading, hasConversation, isInitializing]);

  useEffect(() => {
    const messageIds = new Set(messages.map((m) => m.messageId));
    setQueue((old) => {
      const fresh = [...old].filter(({ id }) =>
        messageIds.has(id.split("--")[0])
      );

      return fresh;
    });
  }, [messages, setQueue]);

  const submitQuestion = (parentId) => {
    if (query.trim()) {
      submit(query.trim(), chatId, parentId);
      setQuery("");
      setAutoScroll(true);
    }
  };

  const lastUserQuestion = useMemo(
    () => messages.filter((message) => message.role === "user").at(-1),
    [messages]
  );
  const retryLastQuestion = useCallback(() => {
    if (!lastUserQuestion) {
      return;
    }
    const { content: question, chatId, parentId, messageId } = lastUserQuestion;
    submit(question, chatId, parentId, messageId);
  }, [lastUserQuestion, submit]);

  return (
    <>
      <PlayQueue gleanContext={AI_HELP} />
      <AIHelpHistory
        currentChatId={chatId}
        lastUpdate={lastUpdate}
        isFinished={isFinished}
        messageId={messages.length === 2 ? messages[0]?.messageId : undefined}
      />
      <Container>
        <AiHelpBanner />
        {isQuotaLoading || isHistoryLoading ? (
          <Loading />
        ) : (
          <section className="ai-help-inner">
            <div ref={bodyRef} className="ai-help-body">
              {hasConversation && (
                <ul className="ai-help-messages">
                  {messages.map((message, index) => {
                    return (
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
                        {message.role === "user" ? (
                          <AIHelpUserQuestion
                            message={message}
                            submit={submit}
                            canEdit={!isQuotaExceeded(quota)}
                            nextPrev={nextPrev}
                            siblingCount={siblingCount}
                          />
                        ) : (
                          <AIHelpAssistantResponse
                            message={message}
                            queuedExamples={queuedExamples}
                            setQueue={setQueue}
                            messages={messages}
                          />
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            {hasError && (
              <NoteCard extraClasses="ai-help-error" type="error">
                <h4>Error</h4>
                <p>
                  An error occurred.{" "}
                  {lastUserQuestion && (
                    <>
                      Please{" "}
                      <Button type="link" onClickHandler={retryLastQuestion}>
                        try again
                      </Button>
                      .
                    </>
                  )}
                </p>
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
                    ■ Stop answering
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
                  <div className="ai-help-refine-or-new">
                    {hasConversation && (
                      <Button
                        type="action"
                        icon="new-topic"
                        isDisabled={
                          isLoading || isResponding || isQuotaExceeded(quota)
                        }
                        extraClasses="ai-help-new-question-button"
                        onClickHandler={() => {
                          gleanClick(`${AI_HELP}: topic new`);
                          setQuery("");
                          setQueue([]);
                          setHighlightedQueueExample(null);
                          reset();
                          window.setTimeout(() => window.scrollTo(0, 0));
                        }}
                      >
                        New Topic
                      </Button>
                    )}
                    <form
                      ref={formRef}
                      className="ai-help-input-form"
                      onSubmit={(event) => {
                        event.preventDefault();
                        submitQuestion(messages.at(-1)?.messageId);
                      }}
                    >
                      <ExpandingTextarea
                        ref={inputRef}
                        autoFocus={true}
                        disabled={isLoading || isResponding}
                        enterKeyHint="send"
                        onKeyDown={(event) => {
                          if (event.key === "Enter" && !event.shiftKey) {
                            event.preventDefault();
                            submitQuestion(messages.at(-1)?.messageId);
                          }
                        }}
                        onChange={(event) => setQuery(event.target.value)}
                        value={query}
                        rows={1}
                        placeholder={placeholder(
                          isLoading
                            ? MESSAGE_SEARCHING
                            : isResponding
                              ? MESSAGE_ANSWERING
                              : hasConversation
                                ? "Ask your follow up question"
                                : "Ask your question"
                        )}
                      />
                      <div className="ai-help-input-actions">
                        {!query && !hasConversation ? (
                          <Button
                            type="action"
                            icon={previousChatId ? "return" : "cancel"}
                            buttonType="reset"
                            title={
                              previousChatId
                                ? "Return to previous question"
                                : "Cancel"
                            }
                            isDisabled={Boolean(!previousChatId)}
                            onClickHandler={() => {
                              gleanClick(
                                `${AI_HELP}: ${
                                  previousChatId ? "topic return" : "cancel"
                                }`
                              );
                              unReset();
                            }}
                          >
                            <span className="visually-hidden">
                              Previous question
                            </span>
                          </Button>
                        ) : query ? (
                          <Button
                            type="action"
                            icon="cancel"
                            buttonType="reset"
                            title="Clear question"
                            onClickHandler={() => {
                              gleanClick(`${AI_HELP}: clear`);
                              setQuery("");
                            }}
                          >
                            <span className="visually-hidden">
                              Reset question
                            </span>
                          </Button>
                        ) : null}
                        <Button
                          type="action"
                          icon="send"
                          buttonType="submit"
                          title="Submit question"
                          isDisabled={!query.trim()}
                        >
                          <span className="visually-hidden">
                            Submit question
                          </span>
                        </Button>
                      </div>
                    </form>
                  </div>
                  <div className="ai-help-footer-text">
                    <span>
                      Results based on MDN's most recent documentation and
                      powered by {gptVersion}, an LLM by{" "}
                      <a
                        href="https://platform.openai.com/docs/api-reference/models"
                        className="external"
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        OpenAI
                      </a>
                      . Please verify information independently as LLM responses
                      may not be 100% accurate. Read our{" "}
                      <Button
                        type="link"
                        onClickHandler={() => setShowDisclaimer(true)}
                      >
                        full guidance
                      </Button>{" "}
                      for more details.
                    </span>
                    <MDNModal
                      isOpen={showDisclaimer}
                      onRequestClose={() => setShowDisclaimer(false)}
                    >
                      <header className="modal-header">
                        <h2 className="modal-heading">
                          AI Help Usage Guidance
                        </h2>
                        <Button
                          onClickHandler={() => setShowDisclaimer(false)}
                          type="action"
                          icon="cancel"
                          extraClasses="close-button"
                        />
                      </header>
                      <div className="modal-body">
                        <p>
                          Our AI Help feature employs {gptVersion}, a Large
                          Language Model (LLM) developed by{" "}
                          <a
                            href="https://platform.openai.com/docs/api-reference/models"
                            className="external"
                            target="_blank"
                            rel="noreferrer noopener"
                          >
                            OpenAI
                          </a>
                          . While it's designed to offer helpful and relevant
                          information drawn from MDN's comprehensive
                          documentation, it's important to bear in mind that it
                          is an LLM and may not produce perfectly accurate
                          information in every circumstance.
                        </p>
                        <p>
                          We strongly advise all users to cross-verify the
                          information generated by this AI Help feature,
                          particularly for complex or critical topics. While we
                          strive for accuracy and relevance, the nature of AI
                          means that responses may vary in precision.
                        </p>
                        <p>
                          The AI Help feature provides links at the end of its
                          responses to support further reading and verification
                          within the MDN documentation. These links are intended
                          to facilitate deeper understanding and context.
                        </p>
                        <p>
                          As you use the AI Help feature, keep in mind its
                          nature as an LLM. It's not perfect, but it's here to
                          assist you as best as it can. We're excited to have
                          you try AI Help, and we hope it makes your MDN
                          experience even better.
                        </p>
                      </div>
                    </MDNModal>
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
                    className={["ai-help-example", `category-${category}`].join(
                      " "
                    )}
                    onClick={() => {
                      gleanClick(`${AI_HELP}: example ${1 + index}`);
                      setQuery(query);
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
        )}
      </Container>
    </>
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
  const [autoScroll, setAutoScroll] = useState(false);
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

function ReportIssueOnGitHubLink({
  messages,
  currentMessage,
  children,
}: {
  messages: Message[];
  currentMessage: Message;
  children: React.ReactNode;
}) {
  const gleanClick = useGleanClick();
  const currentMessageIndex = messages.indexOf(currentMessage);
  const questions = messages
    .slice(0, currentMessageIndex)
    .filter((message) => message.role === MessageRole.User)
    .map(({ content }) => content);
  const lastQuestion = questions.at(-1);

  const url = new URL("https://github.com/");
  url.pathname = `/${AI_FEEDBACK_GITHUB_REPO}/issues/new`;

  const sp = new URLSearchParams();
  sp.set("title", `[AI Help] Question: ${lastQuestion}`);
  sp.set("questions", questions.map((question) => `1. ${question}`).join("\n"));
  sp.set("answer", currentMessage.content);
  sp.set(
    "sources",
    currentMessage.sources
      ?.map(
        (source) =>
          `- [${source.title}](https://developer.mozilla.org${source.url})`
      )
      .join("\n") ?? "(None)"
  );
  sp.set("template", "ai-help-answer.yml");

  url.search = sp.toString();

  return (
    <a
      href={url.href}
      className="external"
      title="This will take you to GitHub to file a new issue."
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => gleanClick(`${AI_HELP}: report issue`)}
    >
      {children}
    </a>
  );
}
