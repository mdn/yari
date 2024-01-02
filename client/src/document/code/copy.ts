export function addCopyToClipboardButton(
  element: Element,
  header: Element | null | undefined
) {
  if (!header || header.querySelector(".copy-icon")) return;

  const button = document.createElement("button");
  const span = document.createElement("span");
  const liveregion = document.createElement("span");

  span.textContent = "Copy to Clipboard";

  button.setAttribute("type", "button");
  button.setAttribute("class", "icon copy-icon");
  span.setAttribute("class", "visually-hidden");
  liveregion.classList.add("copy-icon-message", "visually-hidden");
  liveregion.setAttribute("role", "alert");

  button.appendChild(span);
  header.appendChild(button);
  header.appendChild(liveregion);

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
      showCopiedMessage(header, "Copied!");
    } else {
      button.classList.add("failed");
      showCopiedMessage(header, "Error trying to copy to clipboard!");
    }

    setTimeout(
      () => {
        hideCopiedMessage(header);
      },
      copiedSuccessfully ? 1000 : 3000
    );
  };
}
function showCopiedMessage(wrapper: Element, msg: string) {
  const element = getCopiedMessageElement(wrapper);
  element.textContent = msg;
  element.classList.remove("visually-hidden");
}

function hideCopiedMessage(wrapper: Element) {
  const element = getCopiedMessageElement(wrapper);
  element.textContent = ""; // ensure contents change, so that they are picked up by the live region
  if (element) {
    element.classList.add("visually-hidden");
  }
}

function getCopiedMessageElement(wrapper: Element) {
  const className = "copy-icon-message";
  let element: HTMLSpanElement | null = wrapper.querySelector(
    `span.${className}`
  );
  if (!element) {
    element = document.createElement("span");
    element.classList.add(className);
    element.classList.add("visually-hidden");
    element.setAttribute("role", "alert");
    wrapper.appendChild(element);
  }
  return element;
}
