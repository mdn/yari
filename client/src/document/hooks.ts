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

    if (!isClipboardSupported()) {
      console.log(
        "Copy-to-clipboard disabled because your browser does not appear to support it"
      );
      // bail and don't inject buttons to DOM
      return;
    }

    [...document.querySelectorAll("div.code-example pre")].forEach(
      (element) => {
        const userMessage = document.createElement("span");
        const button = document.createElement("button");
        const span = document.createElement("span");
        userMessage.textContent = "Copied!";
        span.textContent = "Copy to Clipboard";

        const wrapper: HTMLElement | null = element.parentElement;

        userMessage.setAttribute("class", "user-message");
        userMessage.setAttribute("aria-hidden", "true");
        button.setAttribute("aria-hidden", "false");
        button.setAttribute("type", "button");
        button.setAttribute("class", "copy-icon");
        span.setAttribute("class", "visually-hidden");

        button.appendChild(span);
        wrapper?.appendChild(button);
        wrapper?.appendChild(userMessage);

        button.onclick = () => {
          userMessage.classList.add("show");
          userMessage.setAttribute("aria-hidden", "false");
          copyToClipboard(element);
          button.classList.add("copied");
          userMessage.style.top = "52px";

          setTimeout(() => {
            userMessage.classList.remove("show");
            userMessage.setAttribute("aria-hidden", "true");
          }, 1000);
        };
      }
    );
  }, [doc]);
}

function isClipboardSupported() {
  const browser = navigator.userAgent;
  let isSupported = true;
  // @ts-expect-error
  const windowClipboard = window.clipboardData;

  if (
    windowClipboard &&
    windowClipboard.setData &&
    browser.indexOf("Microsoft Internet Explorer") > -1
  ) {
    // Clipboard Web API is not supported in IE
    isSupported = false;
  }
  return isSupported;
}

function copyToClipboard(element) {
  const code = element.textContent || "";

  // Since we bail early in the custom hook if the Clipboard Web API
  // isn't supported, I don't see a reason to include an else branch
  // here for window.clipboardData.setData() which is supported in IE
  // but is experimental, also since we bail if Clibpoard API
  // isn't supported, is this extra check even necessary since we wont
  // reach the copyToClipboard function invocation in the custom hook if
  // !isClipboardSupported() since we log a message to console and return
  if (isClipboardSupported()) {
    navigator.clipboard.writeText(code);
  }
}
