import { PLAYGROUND_BASE_HOST } from "../env";

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

export async function initPlayIframe(
  iframe: HTMLIFrameElement | null,
  editorContent: EditorContent | null,
  fullscreen: boolean = false
) {
  if (!iframe || !editorContent) {
    return;
  }

  const sp = new URLSearchParams([
    ["state", await compressAndBase64Encode(JSON.stringify(editorContent))],
  ]);

  if (fullscreen) {
    const url = new URL(
      `${window.location.protocol}//${
        PLAYGROUND_BASE_HOST.startsWith("localhost")
          ? ""
          : `${crypto.randomUUID()}.`
      }${PLAYGROUND_BASE_HOST}`
    );
    url.pathname = "/play-runner.html";
    url.search = sp.toString();
    window.location.href = url.href;
  } else if (iframe) {
    const url = new URL(iframe.src);
    url.search = sp.toString();
    iframe.src = url.href;
  }
}

export async function compressAndBase64Encode(inputString: string) {
  function bytesToBase64(bytes: ArrayBuffer) {
    const binString = Array.from(new Uint8Array(bytes), (byte: number) =>
      String.fromCodePoint(byte)
    ).join("");
    return btoa(binString);
  }
  const inputArray = new Blob([inputString]);

  const compressionStream = new CompressionStream("deflate-raw");

  const compressedStream = new Response(
    inputArray.stream().pipeThrough(compressionStream)
  ).arrayBuffer();

  const base64String = bytesToBase64(await compressedStream);

  return base64String;
}
