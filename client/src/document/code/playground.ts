import { EditorContent, SESSION_KEY } from "../../playground/utils";
import { PLAYGROUND } from "../../telemetry/constants";

const LIVE_SAMPLE_PARTS = ["html", "css", "js"];

const SECTION_RE = /h[1-6]/i;
function partOfSection(heading: Element, element: Element) {
  if (
    SECTION_RE.test(element.tagName) &&
    element.tagName.toLowerCase() <= heading.tagName.toLowerCase()
  ) {
    return false;
  }
  return true;
}

function sectionForHeading(heading: Element | null): Element[] {
  const nodes: Element[] = [];
  if (heading === null) {
    return [];
  }
  if (!SECTION_RE.test(heading.tagName)) {
    return [...heading.children];
  }
  let next = heading.nextElementSibling;
  while (next && partOfSection(heading, next)) {
    nodes.push(next);
    if (next.nextElementSibling === null) {
      next = next.parentElement?.nextElementSibling?.firstElementChild || null;
    } else {
      next = next.nextElementSibling;
    }
  }
  return nodes;
}

function closestHeading(element: Element) {
  let prev = element;
  while (prev.parentElement?.firstElementChild) {
    if (SECTION_RE.test(prev.parentElement.firstElementChild.tagName)) {
      return prev.parentElement.firstElementChild;
    }
    prev = prev.parentElement;
  }
  return null;
}

function prevHeading(heading: Element) {
  let prev = heading;
  while (prev.parentElement?.previousElementSibling?.firstElementChild) {
    prev = prev.parentElement.previousElementSibling.firstElementChild;
    if (
      SECTION_RE.test(prev.tagName) &&
      prev.tagName.toLowerCase() < heading.tagName.toLowerCase()
    ) {
      return prev;
    }
  }
  return null;
}

export function addBreakoutButton(
  element: Element | null,
  id: string,
  code: EditorContent,
  locale: string
) {
  if (!element || !element.querySelector("play-sample")) {
    element?.classList.add("play-sample");
  } else {
    return;
  }
  if (!element || element.querySelector(".play-button")) return;
  const button = document.createElement("button");

  button.textContent = "Play";

  button.setAttribute("class", "play-button external");
  button.type = "button";
  button.dataset.glean = `${PLAYGROUND}: breakout->${id}`;
  button.title = "Open in Playground";
  element.appendChild(button);

  button.addEventListener("click", (e) => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(code));
    const url = new URL(window?.location.href);
    url.pathname = `/${locale}/play`;
    url.hash = "";
    url.search = "";
    if (e.shiftKey === true) {
      window.location.href = url.href;
    } else {
      window.open(url, "_blank");
    }
  });
}

export function collectCode(): EditorContent {
  const selected = [
    ...document.querySelectorAll(
      ".example-header.play-collect > div > input:checked"
    ),
  ]
    .map((e) => e.parentElement?.parentElement?.nextElementSibling)
    .filter(Boolean);

  return {
    js: selected
      .map((pre) =>
        pre?.classList.contains("js") || pre?.classList.contains("javascript")
          ? pre.textContent
          : null
      )
      .filter(Boolean)
      .join("\n"),
    css: selected
      .map((pre) => (pre?.classList.contains("css") ? pre.textContent : null))
      .filter(Boolean)
      .join("\n"),
    html: selected
      .map((pre) => (pre?.classList.contains("html") ? pre.textContent : null))
      .filter(Boolean)
      .join("\n"),
  };
}

export function addCollectButton(
  element: Element | null,
  id: string,
  locale: string
) {
  if (!element || !element.querySelector("play-collect")) {
    element?.classList.add("play-collect");
  } else {
    return;
  }
  if (!element || element.querySelector(".play-button")) return;
  const checkId = crypto.randomUUID();
  const playlist = document.createElement("div");
  playlist.classList.add("playlist");
  const checkLabel = document.createElement("label");
  checkLabel.htmlFor = checkId;
  checkLabel.textContent = "";
  const check = document.createElement("input");
  check.addEventListener("change", (e) => {
    const ct = e.currentTarget as HTMLInputElement | null;
    if (ct?.dataset) {
      ct.dataset.queued = `${ct.checked} `;
    }
  });
  check.type = "checkbox";
  check.id = checkId;
  const button = document.createElement("button");

  button.textContent = "play";

  button.classList.add("play-button", "external");
  button.type = "button";
  button.setAttribute("data-play", id);
  button.title = "Open in Playground";
  playlist.appendChild(check);
  playlist.appendChild(checkLabel);
  playlist.appendChild(button);
  element.appendChild(playlist);

  button.addEventListener("click", (e) => {
    check.checked = true;
    const code = collectCode();
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(code));
    const url = new URL(window?.location.href);
    url.pathname = `/${locale}/play`;
    url.hash = "";
    url.search = "";
    if (e.shiftKey === true) {
      window.location.href = url.href;
    } else {
      window.open(url, "_blank");
    }
  });
}

function codeForHeading(
  heading: Element,
  src: string
): { code: EditorContent; nodes: Element[] } | null {
  const section = sectionForHeading(heading);

  if (!section.length) {
    return null;
  }
  const code: EditorContent = {
    css: "",
    html: "",
    js: "",
    src,
  };

  const nodes: Element[] = [];
  for (const part of LIVE_SAMPLE_PARTS) {
    const src = section
      .flatMap((e) => [...e?.querySelectorAll(`pre.${part}`)])
      .map((e) => {
        nodes.push(e);
        return e.textContent;
      })
      .join("\n");
    if (src) {
      code[part] += src;
    }
  }
  return nodes.length ? { code, nodes } : null;
}

function getLanguage(node: Element): string | null {
  for (const part of LIVE_SAMPLE_PARTS) {
    if (node.classList.contains(part)) {
      return part;
    }
  }
  return null;
}

export function getCodeAndNodesForIframeBySampleClass(
  cls: string,
  src: string
) {
  const code: EditorContent = {
    css: "",
    html: "",
    js: "",
    src,
  };

  let empty = true;
  const nodes: Element[] = [];
  [...document.getElementsByClassName(`live-sample___${cls}`)].forEach(
    (pre) => {
      let lang = getLanguage(pre);
      if (lang === null) {
        return;
      }
      empty = false;
      nodes.push(pre);
      code[lang] += pre.textContent;
    }
  );
  return empty ? null : { code, nodes };
}

export function getCodeAndNodesForIframe(
  id: string,
  iframe: Element,
  src: string
) {
  let heading = document.getElementById(id) || closestHeading(iframe);
  if (!heading) {
    return null;
  }
  let r = codeForHeading(heading, src);
  while (r === null) {
    heading = prevHeading(heading);
    if (heading === null) {
      return null;
    }
    r = codeForHeading(heading, src);
  }
  return r;
}
