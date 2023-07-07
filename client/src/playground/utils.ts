export const SESSION_KEY = "playground-session-code";

export interface EditorContent {
  css: string;
  html: string;
  js: string;
  src?: string;
}

export interface Message {
  typ: string;
  state: EditorContent;
}

export function updatePlayIframe(
  iframe: HTMLIFrameElement | null,
  editorContent: EditorContent | null
) {
  if (!iframe || !editorContent) {
    return;
  }

  const message: Message = {
    typ: "init",
    state: editorContent,
  };

  iframe.contentWindow?.postMessage(message, {
    targetOrigin: "*",
  });
}

export function codeToMarkdown(code: EditorContent): string {
  const parts: string[] = [];
  if (code.html) {
    parts.push(["```html", code.html, "```"].join("\n"));
  }
  if (code.css) {
    parts.push(["```css", code.css, "```"].join("\n"));
  }
  if (code.js) {
    parts.push(["```js", code.js, "```"].join("\n"));
  }
  return parts.join("\n\n");
}

export function initPlayIframe(
  iframe: HTMLIFrameElement | null,
  editorContent: EditorContent | null
) {
  if (!iframe || !editorContent) {
    return;
  }

  const message: Message = {
    typ: "init",
    state: editorContent,
  };
  iframe.contentWindow?.postMessage?.(message, { targetOrigin: "*" });
  const deferred = ({ data: { typ = null, prop = {} } = {} } = {}) => {
    const id = new URL(iframe.src, "https://example.com").searchParams.get(
      "id"
    );
    if (id === prop["id"]) {
      if (typ === "ready") {
        iframe.contentWindow?.postMessage(message, { targetOrigin: "*" });
      }
    }
  };
  window.addEventListener("message", deferred);
}
