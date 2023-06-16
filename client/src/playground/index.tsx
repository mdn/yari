import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import useSWRImmutable from "swr/immutable";
import prettier from "prettier/esm/standalone.mjs";
import parserBabel from "prettier/esm/parser-babel.mjs";
import parserCSS from "prettier/esm/parser-postcss.mjs";
import parserHTML from "prettier/esm/parser-html.mjs";

import { Button } from "../ui/atoms/button";
import Editor, { EditorHandle } from "./editor";
import { SidePlacement } from "../ui/organisms/placement";
import { EditorContent, updatePlayIframe } from "./utils";

import "./index.scss";
import { Switch } from "../ui/atoms/switch";
import { PLAYGROUND_BASE_URL } from "../env";
import { FlagForm, ShareForm } from "./forms";
import { Console, VConsole } from "./console";
import { useGleanClick } from "../telemetry/glean-context";
import { PLAYGROUND } from "../telemetry/constants";
import { InfoTooltip } from "../document/molecules/tooltip";

const HTML_DEFAULT = "";
const CSS_DEFAULT = "";
const JS_DEFAULT = "";

enum State {
  initial,
  remote,
  modified,
}

enum DialogState {
  none,
  share,
  flag,
}

async function save(editorContent: EditorContent) {
  const res = await fetch("/api/v1/play/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(editorContent),
  });
  let { id } = await res.json();
  let url = new URL(document.URL);
  url.search = new URLSearchParams([["id", id]]).toString();
  return url;
}

function store(session: string, editorContent: EditorContent) {
  sessionStorage.setItem(session, JSON.stringify(editorContent));
}

function load(session: string) {
  let code = JSON.parse(sessionStorage.getItem(session) || "{}");
  return {
    html: code?.html || HTML_DEFAULT,
    css: code?.css || CSS_DEFAULT,
    js: code?.js || JS_DEFAULT,
    src: code?.src,
  };
}

export default function Playground() {
  const gleanClick = useGleanClick();
  let [searchParams, setSearchParams] = useSearchParams();
  const gistId = searchParams.get("id");
  const sampleKey = searchParams.get("sample");
  const sessionKey = searchParams.get("session");
  let [dialogState, setDialogState] = useState(DialogState.none);
  let [shared, setShared] = useState(false);
  let [shareUrl, setShareUrl] = useState<URL | null>(null);
  let [vConsole, setVConsole] = useState<VConsole[]>([]);
  let [state, setState] = useState(State.initial);
  let [codeSrc, setCodeSrc] = useState<string | undefined>();
  const session = useRef(sessionKey || crypto.randomUUID());
  const subdomain = useRef<string>(crypto.randomUUID());
  let { data: initialCode } = useSWRImmutable<EditorContent>(
    !shared && gistId ? `/api/v1/play/${encodeURIComponent(gistId)}` : null,
    async (url) => {
      const response = await fetch(url);

      if (!response.ok) {
        throw Error(response.statusText);
      }

      return (await response.json()) || null;
    },
    {
      fallbackData:
        (!gistId &&
          (sampleKey ? load(sampleKey) : sessionKey && load(sessionKey))) ||
        undefined,
    }
  );
  let [unsafe, setUnsafe] = useState(
    Boolean(sampleKey && initialCode && !gistId)
  );
  const htmlRef = useRef<EditorHandle | null>(null);
  const cssRef = useRef<EditorHandle | null>(null);
  const jsRef = useRef<EditorHandle | null>(null);
  const iframe = useRef<HTMLIFrameElement | null>(null);
  const diaRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    if (!sessionKey) {
      initialCode && store(session.current, initialCode);
      setSearchParams([["session", session.current]], { replace: true });
    }
  }, [initialCode, sessionKey, setSearchParams]);

  const getEditorContent = useCallback(() => {
    const code = {
      html: htmlRef.current?.getContent() || HTML_DEFAULT,
      css: cssRef.current?.getContent() || CSS_DEFAULT,
      js: jsRef.current?.getContent() || JS_DEFAULT,
      src: initialCode?.src,
    };
    store(session.current, code);
    return code;
  }, [initialCode?.src]);

  let messageListener = useCallback(
    ({ data: { typ, prop, message } }) => {
      if (typ === "console") {
        if (prop === "clear") {
          setVConsole([]);
        } else {
          setVConsole((vConsole) => [...vConsole, { prop, message }]);
        }
      } else if (typ === "ready") {
        updatePlayIframe(iframe.current, getEditorContent());
      }
    },
    [getEditorContent]
  );
  useEffect(() => {
    if (state === State.initial) {
      if (initialCode && Object.values(initialCode).some(Boolean)) {
        htmlRef.current?.setContent(initialCode?.html);
        cssRef.current?.setContent(initialCode?.css);
        jsRef.current?.setContent(initialCode?.js);
        setState(State.remote);
        if (initialCode.src) {
          setCodeSrc(
            initialCode?.src &&
              `${initialCode.src.split("/").slice(0, -1).join("/")}`
          );
        }
        if (sampleKey) {
          setSearchParams([], { replace: true });
        }
      } else {
        htmlRef.current?.setContent(HTML_DEFAULT);
        cssRef.current?.setContent(CSS_DEFAULT);
        jsRef.current?.setContent(JS_DEFAULT);
      }
    }
  }, [initialCode, state, sampleKey, setSearchParams]);
  useEffect(() => {
    window.addEventListener("message", messageListener);
    return () => {
      window.removeEventListener("message", messageListener);
    };
  }, [messageListener]);
  const reset = async () => {
    setSearchParams([], { replace: true });
    setCodeSrc(undefined);
    htmlRef.current?.setContent(HTML_DEFAULT);
    cssRef.current?.setContent(CSS_DEFAULT);
    jsRef.current?.setContent(JS_DEFAULT);

    updateWithEditorContent();
  };
  const resetConfirm = async () => {
    if (window.confirm("Do you really want to reset everything?")) {
      gleanClick(`${PLAYGROUND}: reset-click`);
      await reset();
    }
  };

  const updateWithEditorContent = () => {
    const loading = [
      {},
      {
        backgroundColor: "var(--background-mark-green)",
      },
      {},
    ];

    const timing = {
      duration: 1000,
      iterations: 1,
    };
    document.getElementById("run")?.firstElementChild?.animate(loading, timing);
    iframe.current?.contentWindow?.postMessage(
      {
        typ: "reload",
      },
      {
        targetOrigin: "*",
      }
    );
  };

  const format = () => {
    const { html, css, js } = getEditorContent();

    try {
      const formatted = {
        html: prettier.format(html, { parser: "html", plugins: [parserHTML] }),
        css: prettier.format(css, { parser: "css", plugins: [parserCSS] }),
        js: prettier.format(js, { parser: "babel", plugins: [parserBabel] }),
      };
      htmlRef.current?.setContent(formatted.html);
      cssRef.current?.setContent(formatted.css);
      jsRef.current?.setContent(formatted.js);
    } catch (e) {
      console.error(e);
    }
  };
  const share = async () => {
    const url = await save(getEditorContent());
    setShared(true);
    setShareUrl(url);
  };

  // We're using a random subdomain for origin isolation.
  // Optionally prefix with "unsafe-" to receive less restrictive CSP headers.
  const src = new URL(
    `${window.location.protocol}//${
      PLAYGROUND_BASE_URL.startsWith("localhost") ? "" : `${subdomain.current}.`
    }${PLAYGROUND_BASE_URL}`
  );
  src.pathname = `${codeSrc || ""}/${unsafe ? "unsafe-" : ""}runner.html`;

  const cleanDialog = () => {
    if (dialogState === DialogState.share) {
      setShareUrl(null);
    }
  };

  return (
    <>
      <main className="play container">
        <dialog id="playDialog" ref={diaRef} onClose={cleanDialog}>
          {dialogState === DialogState.flag && <FlagForm gistId={gistId} />}
          {dialogState === DialogState.share && (
            <ShareForm url={shareUrl} code={getEditorContent} share={share} />
          )}
        </dialog>
        <section className="editors">
          <aside>
            <Switch
              name="toggle-unsafe"
              checked={unsafe}
              toggle={(e) => setUnsafe(e.target.checked)}
            >
              Load unsafe content
            </Switch>
            <InfoTooltip>
              Allow the Playground to load media and scripts from 3rd parties.
              And loosens the CSP restrictions for the Playground. This allows
              running inline code.
            </InfoTooltip>
            <menu>
              <Button type="secondary" id="format" onClickHandler={format}>
                format
              </Button>
              <Button
                type="secondary"
                id="run"
                onClickHandler={updateWithEditorContent}
              >
                run
              </Button>
              <Button
                type="secondary"
                id="share"
                onClickHandler={() => {
                  gleanClick(`${PLAYGROUND}: share-click`);
                  setDialogState(DialogState.share);
                  diaRef.current?.showModal();
                }}
              >
                share
              </Button>
              <Button
                type="secondary"
                id="reset"
                extraClasses="red"
                onClickHandler={resetConfirm}
              >
                reset
              </Button>
            </menu>
          </aside>
          <Editor
            ref={htmlRef}
            language="html"
            callback={updateWithEditorContent}
          ></Editor>
          <Editor
            ref={cssRef}
            language="css"
            callback={updateWithEditorContent}
          ></Editor>
          <Editor
            ref={jsRef}
            language="javascript"
            callback={updateWithEditorContent}
          ></Editor>
        </section>
        <section className="preview">
          {gistId && (
            <button
              className="flag-example"
              onClick={(e) => {
                e.preventDefault();
                gleanClick(`${PLAYGROUND}: flag-click`);
                setDialogState(DialogState.flag);
                diaRef.current?.showModal();
              }}
            >
              Seeing something inappropriate?
            </button>
          )}
          <iframe
            title="runner"
            ref={iframe}
            src={src.toString()}
            sandbox="allow-scripts allow-same-origin"
          ></iframe>
          <Console vConsole={vConsole} />
          <SidePlacement />
        </section>
      </main>
    </>
  );
}
