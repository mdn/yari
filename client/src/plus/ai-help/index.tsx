import Prism from "prismjs";
import {
  Children,
  MutableRefObject,
  ReactElement,
  useEffect,
  useRef,
  useState,
} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Message, MessageRole, Quota, useAiChat } from "./use-ai";
import { AiLoginBanner, AiUpsellBanner } from "./banners";
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
import MDNModal from "../../ui/atoms/modal";
import { AI_FEEDBACK_GITHUB_REPO } from "../../env";

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
              href={
                user?.isAuthenticated
                  ? "https://survey.alchemer.com/s3/7418589/MDN-AI-Help-Feedback"
                  : "https://survey.alchemer.com/s3/7405739/MDN-AI-Help"
              }
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
        <div className="notecard experimental">
          <p>
            <strong>This is a beta feature.</strong>
            <br />
            May occasionally generate incorrect answers. Please always verify
            information independently.
            <br />
            <a href="/en-US/blog/introducing-ai-help/">
              <strong>Learn more</strong>
            </a>
          </p>
        </div>
      </Container>
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
  const [showDisclaimer, setShowDisclaimer] = useState(false);
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
                          pre: ({ node, className, children, ...props }) => {
                            const code = Children.toArray(children)
                              .map(
                                (child) =>
                                  /language-(\w+)/.exec(
                                    (child as ReactElement)?.props?.className ||
                                      ""
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
                            return (
                              <div className="code-example">
                                <p className="example-header">
                                  <span className="language-name">{code}</span>
                                </p>
                                <pre className={`brush: ${code}`}>
                                  {children}
                                </pre>
                              </div>
                            );
                          },
                          code: ({ inline, className, children, ...props }) => {
                            const match = /language-(\w+)/.exec(
                              className || ""
                            );
                            const lang = Prism.languages[match?.[1]];
                            return !inline && lang ? (
                              <code
                                {...props}
                                className={className}
                                dangerouslySetInnerHTML={{
                                  __html: Prism.highlight(
                                    String(children),
                                    lang
                                  ),
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
                            <section className="ai-help-feedback">
                              <GleanThumbs
                                feature="ai-help-answer"
                                question={"Was this answer useful?"}
                                upLabel={"Yes, this answer was useful."}
                                downLabel={"No, this answer was not useful."}
                                permanent={true}
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
                GPT-3.5, an LLM by{" "}
                <a
                  href="https://platform.openai.com/docs/api-reference/models"
                  className="external"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  OpenAI
                </a>
                . Please verify information independently as LLM responses may
                not be 100% accurate. Read our{" "}
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
                  <h2 className="modal-heading">AI Help Usage Guidance</h2>
                  <Button
                    onClickHandler={() => setShowDisclaimer(false)}
                    type="action"
                    icon="cancel"
                    extraClasses="close-button"
                  />
                </header>
                <div className="modal-body">
                  <p>
                    Our AI Help feature employs GPT-3.5, a Language Learning
                    Model (LLM) developed by{" "}
                    <a
                      href="https://platform.openai.com/docs/api-reference/models"
                      className="external"
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      OpenAI
                    </a>
                    . While it's designed to offer helpful and relevant
                    information drawn from MDN's comprehensive documentation,
                    it's important to bear in mind that it is an LLM and may not
                    produce perfectly accurate information in every
                    circumstance.
                  </p>
                  <p>
                    We strongly advise all users to cross-verify the information
                    generated by this AI Help feature, particularly for complex
                    or critical topics. While we strive for accuracy and
                    relevance, the nature of AI means that responses may vary in
                    precision.
                  </p>
                  <p>
                    The AI Help feature provides links at the end of its
                    responses to support further reading and verification within
                    the MDN documentation. These links are intended to
                    facilitate deeper understanding and context.
                  </p>
                  <p>
                    As you use the AI Help feature, keep in mind its nature as
                    an LLM. It's not perfect, but it's here to assist you as
                    best as it can. We're excited to have you try AI Help, and
                    we hope it makes your MDN experience even better.
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

function ReportIssueOnGitHubLink({
  messages,
  currentMessage,
  children,
}: {
  messages: Message[];
  currentMessage: Message;
  children: React.ReactNode;
}) {
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
    >
      {children}
    </a>
  );
}
