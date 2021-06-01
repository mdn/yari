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
    // '#content pre' works but also selects <pre>
    // tags without class="brush:*", like class="notranslate"
    // which represent 'formal_syntax' <pre> content, and
    // syntax highlight isn't targeting <pre class="notranslate">
    // its getting $(pre[class*=brush]), this is in regards to wrapping
    // <pre> tags with a <div> to absolutely position the
    // copy-to-clipboard <button> relatively in the newly added parent div,
    // instead of selecting #content pre which grabs
    // class="notranslate" formal syntax tags, just grab
    // the <pre class="brush"> tags which are injected into
    // a `<div class="code-example">` from syntax highlighter
    [...document.querySelectorAll("div.code-example pre")].forEach(
      (element) => {
        const userMessage = document.createElement("span");
        const button = document.createElement("button");
        const span = document.createElement("span");
        userMessage.textContent = "Copied!";
        span.textContent = "Copy to Clipboard";

        // With the syntaxHighlight macro changes to wrap
        // each <pre> in a <div> for layout reasons,
        // each parentNode will now be the div with the
        // <pre class="brush"> tag as its only child
        // could use wrapper : any without wrapper? but a bit stronger typing
        // doesnt hurt
        const wrapper: HTMLElement | null = element.parentElement;

        userMessage.setAttribute("class", "user-message");
        userMessage.setAttribute("aria-hidden", "true");
        button.setAttribute("aria-hidden", "true");
        button.setAttribute("type", "button");
        button.setAttribute("class", "copy-icon");
        span.setAttribute("class", "visually-hidden");

        button.appendChild(span);
        wrapper?.appendChild(button);
        wrapper?.appendChild(userMessage);

        element.addEventListener("mouseover", () => {
          button.setAttribute("aria-hidden", "false");
        });

        element.addEventListener("mouseout", () => {
          button.setAttribute("aria-hidden", "true");
        });

        button.onclick = () => {
          userMessage.classList.add("show");
          userMessage.setAttribute("aria-hidden", "false");
          copyToClipboard(element);
          button.classList.add("copied");
          userMessage.style.top = "52px";

          // Could probably use keyframes in CSS to fade
          // the user message after 1-1.5s, but
          // the aria-* attr and class add/removing will
          // have to be handled with JS
          setTimeout(() => {
            userMessage.classList.remove("show");
            userMessage.setAttribute("aria-hidden", "true");
          }, 1000);
        };
      }
    );
  }, [doc]);
}

function copyToClipboard(element) {
  const browser = navigator.userAgent;
  const code = element.textContent;
  // expect window.clipboardData to not exist unless browser is IE
  // @ts-expect-error
  const windowClipboard = window.clipboardData;

  // If browswer is IE use window.clipboardData.setData
  // could use window.execCommand('copy') but it is deprecated
  if (
    windowClipboard &&
    windowClipboard.setData &&
    browser.indexOf("Microsoft Internet Explorer") > -1
  ) {
    windowClipboard.setData("text/plain", code);
  } else {
    // A browser that isn't IE (Chrome, Edge, Firefox, etc)
    // Support for the Clipboard API's navigator.clipboard.writeText() method was added in Firefox 63.
    navigator.clipboard.writeText(code);
  }
}
