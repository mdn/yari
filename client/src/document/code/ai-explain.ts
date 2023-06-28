import { SSE } from "sse.js";

interface ExplainRequest {
  language: string | undefined;
  highlighted: string | null;
  sample: string | null;
  signature: string;
}

function explain(
  context: ExplainRequest,
  callback: (data: any, e?: Error) => void
) {
  const source = new SSE("/api/v1/plus/ai/explain", {
    headers: { "Content-Type": "application/json" },
    payload: JSON.stringify(context),
  });
  source.addEventListener("message", (e: { data: string }) =>
    callback(JSON.parse(e.data))
  );
  source.addEventListener("error", (e: Error | undefined) => callback(null, e));
  source.stream();
}

function thumbs(upDown: string, title: string, callback: () => void): Element {
  const thumbs = document.createElement("button");
  thumbs.classList.add("icon", `icon-thumbs-${upDown}`);
  thumbs.setAttribute("data-ai-explain", `thumbs_${upDown}`);
  thumbs.addEventListener("click", callback);
  thumbs.title = title;
  return thumbs;
}

async function postFeedback(
  typ: string,
  getHash: () => string | null,
  signature: string
): Promise<void> {
  const hash = getHash();
  if (hash) {
    await fetch("/api/v1/plus/ai/explain/feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ typ, hash, signature }),
    });
  }
}

function feedback(hash: () => string | null, signature: string): Element {
  const div = document.createElement("div");
  div.classList.add("ai-explain-feedback");
  div.append(document.createTextNode("How's this answer?"));
  div.appendChild(
    thumbs("down", "Was this answer useful?", async () => {
      await postFeedback("thumbs_down", hash, signature);
      div.textContent = "Thank you for your feedback! ❤️";
    })
  );
  div.appendChild(
    thumbs("up", "This answer was useful!", async () => {
      await postFeedback("thumbs_up", hash, signature);
      div.textContent = "Thank you for your feedback.";
    })
  );
  return div;
}

export function addExplainButton(
  element: Element | null | undefined,
  pre: Element
) {
  const signature = pre.getAttribute("data-signature");
  if (!signature || !element || element.querySelector(".ai-explain-button"))
    return;

  const buttonContainer = document.createElement("div");
  const button = document.createElement("button");
  button.textContent = "AI Explain";
  button.classList.add("ai-explain-button");
  button.type = "button";
  button.setAttribute("data-ai-explain", "explain");
  button.title = "Explain (parts of) this example";
  buttonContainer.appendChild(button);
  const info = document.createElement("div");
  info.classList.add("ai-explain-info", "visually-hidden");
  info.textContent =
    "AI Explain leverages OpenAI to explain code examples. To explain a whole example: just click on 'AI Explain'. To explain a part of an example in context: select a part of the example and then click on 'AI Explain'.";
  const infoToggle = document.createElement("button");
  infoToggle.classList.add("ai-explain-info-toggle", "icon", "icon-note-info");
  infoToggle.type = "button";
  infoToggle.setAttribute("data-ai-explain", "info-toggle");
  infoToggle.title = "Toggle AI Explain info";
  infoToggle.addEventListener("click", () =>
    info.classList.toggle("visually-hidden")
  );
  buttonContainer.appendChild(infoToggle);
  element.appendChild(buttonContainer);
  element.appendChild(info);

  const sample = pre.textContent;

  const getHighlighted = () => {
    const selected = window.getSelection()?.toString().replace(/\r\n/g, "\n");
    const highlighted =
      selected && sample?.includes(selected) ? selected : null;
    return highlighted;
  };

  document.addEventListener("selectionchange", (e) => {
    if (getHighlighted()) {
      button.classList.add("ai-explain-highlight");
    } else {
      button.classList.remove("ai-explain-highlight");
    }
  });

  const answers = new Map<string | null, Element>();

  button.addEventListener("click", async (e) => {
    const language = element
      .querySelector(".language-name")
      ?.textContent?.toLowerCase();
    const highlighted = getHighlighted();
    let all = "";

    let answerContainer = answers.get(highlighted);
    if (answerContainer) {
      pre.insertAdjacentElement("afterend", answerContainer);
      return;
    }

    const header = document.createElement("p");
    header.classList.add("ai-explain-header");

    const span = document.createElement("span");
    header.appendChild(span);
    if (highlighted) {
      span.textContent = "Your selection:";
      const highlightedCode = document.createElement("pre");
      highlightedCode.textContent = highlighted;
      header.appendChild(highlightedCode);
    } else {
      span.textContent = "AI Explain:";
    }

    const container = document.createElement("div");
    container.classList.add("ai-explain-answer");
    container.appendChild(header);

    const div = document.createElement("div");

    container.appendChild(div);
    container.append(
      feedback(() => container.getAttribute("data-hash"), signature)
    );
    pre.insertAdjacentElement("afterend", container);

    answers.set(highlighted, container);

    const { render } = await import("./render-md");

    explain(
      {
        language,
        highlighted,
        sample,
        signature,
      },
      (data, err) => {
        if (data) {
          const { choices, initial } = data;
          if (choices) {
            const [{ delta: { content = "" } = {} } = {}] = choices;
            all += content || "";
            div.innerHTML = render(all);
          } else if (initial) {
            container.setAttribute("data-hash", initial.hash);
          }
        }
        if (err) {
          console.error(err);
        }
      }
    );
  });
}
