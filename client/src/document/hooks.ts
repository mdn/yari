import React from "react";
import { useParams } from "react-router-dom";

import { Doc } from "./types";

export function useDocumentURL() {
  const { "*": slug, locale } = useParams();
  const url = `/${locale}/docs/${slug}`;
  // If you're in local development Express will force the trailing /
  // on any URL. We can't keep that if we're going to compare the current
  // pathname with the document's mdn_url.
  return url.endsWith("/") ? url.substring(0, url.length - 1) : url;
}

export function useCopyExamplesToClipboard(doc: Doc | undefined) {
  React.useEffect(() => {
    if (!doc) {
      return;
    }
    if (!navigator.clipboard) {
      console.log(
        "Copy-to-clipboard disabled because your browser does not appear to support it."
      );
      return;
    }

    [...document.querySelectorAll("div.code-example pre:not(.hidden)")].forEach(
      (element) => {
        const wrapper = element.parentElement;
        // No idea how a parentElement could be falsy in practice, but it can
        // in theory and hence in TypeScript. So to having to test for it, bail
        // early if we have to.
        if (!wrapper) return;

        const button = document.createElement("button");
        const span = document.createElement("span");
        span.textContent = "Copy to Clipboard";

        button.setAttribute("aria-hidden", "false");
        button.setAttribute("type", "button");
        button.setAttribute("class", "copy-icon");
        span.setAttribute("class", "visually-hidden");

        button.appendChild(span);
        wrapper.appendChild(button);

        button.onclick = async () => {
          let copiedSuccessfully = true;
          try {
            const text = element.textContent || "";
            await navigator.clipboard.writeText(text);
          } catch (err) {
            console.error(
              "Error when trying to use navigator.clipboard.writeText()",
              err
            );
            copiedSuccessfully = false;
          }

          if (copiedSuccessfully) {
            button.classList.add("copied");
            showCopiedMessage(wrapper, "Copied!");
          } else {
            button.classList.add("failed");
            showCopiedMessage(wrapper, "Error trying to copy to clipboard!");
          }

          setTimeout(
            () => {
              hideCopiedMessage(wrapper);
            },
            copiedSuccessfully ? 1000 : 3000
          );
        };
      }
    );
  }, [doc]);
}

function showCopiedMessage(wrapper: HTMLElement, msg: string) {
  const element = getCopiedMessageElement(wrapper);
  element.textContent = msg;
  element.classList.add("show");
  element.setAttribute("aria-hidden", "false");
}

function hideCopiedMessage(wrapper: HTMLElement) {
  const element = getCopiedMessageElement(wrapper);
  if (element) {
    element.classList.remove("show");
    element.setAttribute("aria-hidden", "true");
  }
}

function getCopiedMessageElement(wrapper: HTMLElement) {
  const className = "copy-icon-message";
  let element: HTMLSpanElement | null = wrapper.querySelector(
    `span.${className}`
  );
  if (!element) {
    element = document.createElement("span");
    element.classList.add(className);
    element.setAttribute("aria-hidden", "true");
    element.style.top = "52px";
    wrapper.appendChild(element);
  }
  return element;
}
