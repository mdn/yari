import Prism from "prismjs";
import { Children, ReactElement } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { isExternalUrl } from "./utils";

export function Markdown({ children }: { children: string }) {
  return (
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
          return (
            <div className="code-example">
              <p className="example-header">
                <span className="language-name">{code}</span>
              </p>
              <pre className={`brush: ${code}`}>{children}</pre>
            </div>
          );
        },
        code: ({ inline, className, children, ...props }) => {
          const match = /language-(\w+)/.exec(className || "");
          const lang = Prism.languages[match?.[1]];
          return !inline && lang ? (
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
      {children}
    </ReactMarkdown>
  );
}
