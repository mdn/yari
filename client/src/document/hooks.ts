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

    const clipboard = navigator.clipboard;

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
          let copiedSuccessfully = true;
          try {
            // If navigator.clipboard is 'undefined' which is falsy
            // then Clipboard API for whatever reason was undefined so
            // we can just bail early
            if (clipboard) {
              copyToClipboard(element);
            } else {
              console.log("Clipboard API is undefined");
              return; // bail
            }
          } catch (err) {
            console.error(err);
            copiedSuccessfully = false;
          }

          if (copiedSuccessfully) {
            userMessage.classList.add("show");
            userMessage.setAttribute("aria-hidden", "false");
            button.classList.add("copied");
            userMessage.style.top = "52px";
          } else {
            button.classList.add("failed");
          }

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
  const text = element.textContent || "";
  navigator.clipboard.writeText(text);
}
