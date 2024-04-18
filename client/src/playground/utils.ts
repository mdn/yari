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
  // Lazy loading is trick cross platform.
  // We send an init message initially because the iframe might be ready already.
  iframe.contentWindow?.postMessage?.(message, { targetOrigin: "*" });
  const deferred = (event: MessageEvent) => {
    const { data: { typ = null, prop = {} } = {}, source = null } = event;
    const id = new URL(iframe.src, "https://example.com").searchParams.get(
      "id"
    );
    if (id === prop["id"] && source === iframe.contentWindow) {
      if (typ === "ready") {
        window.removeEventListener("message", deferred);
        iframe.contentWindow?.postMessage(message, { targetOrigin: "*" });
      }
    }
  };
  // Now we listen for the ready message in case the iframe wasn't ready yet.
  window.addEventListener("message", deferred);
}
