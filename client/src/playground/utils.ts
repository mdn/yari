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
  //const b = new Blob([editorContent.html], {type: "text/html",});

  //iframe.src = URL.createObjectURL(b);
  //return;
  const message: Message = {
    typ: "init",
    state: editorContent,
  };

  if (iframe.contentWindow) {
    if (iframe.contentDocument?.readyState === "loading") {
      iframe.contentDocument?.addEventListener("DOMContentLoaded", () => {
        iframe.contentWindow!.postMessage(message, {
          targetOrigin: "*",
        });
      });
    } else {
      iframe.contentWindow?.postMessage(message, {
        targetOrigin: "*",
      });
    }
  }
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
  const deferred = ({ data: { typ = null, prop = {} } = {} } = {}) => {
    const id = new URL(iframe.src, "https://example.com").searchParams.get(
      "id"
    );
    if (id === prop["id"]) {
      if (typ === "ready") {
        iframe.contentWindow?.postMessage(message, { targetOrigin: "*" });
      }
      window.removeEventListener("message", deferred);
    }
  };
  window.addEventListener("message", deferred);
}
