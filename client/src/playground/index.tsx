import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import useSWRImmutable from "swr/immutable";
import prettier from "prettier/standalone";
import prettierPluginBabel from "prettier/plugins/babel";
import prettierPluginCSS from "prettier/plugins/postcss";
// XXX Using .mjs until https://github.com/prettier/prettier/pull/15018 is deployed
import prettierPluginESTree from "prettier/plugins/estree.mjs";
import prettierPluginHTML from "prettier/plugins/html";

import { Button } from "../ui/atoms/button";
import Editor, { EditorHandle } from "./editor";
import { SidePlacement } from "../ui/organisms/placement";
import { EditorContent, SESSION_KEY, updatePlayIframe } from "./utils";

import "./index.scss";
import { PLAYGROUND_BASE_HOST } from "../env";
import { FlagForm, ShareForm } from "./forms";
import { Console, VConsole } from "./console";
import { useGleanClick } from "../telemetry/glean-context";
import { PLAYGROUND } from "../telemetry/constants";

const HTML_DEFAULT = "";
const CSS_DEFAULT = "";
const JS_DEFAULT = "";

enum State {
  initial,
  ready,
  remote,
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
  return { url, id };
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
  let [dialogState, setDialogState] = useState(DialogState.none);
  let [shared, setShared] = useState(false);
  let [shareUrl, setShareUrl] = useState<URL | null>(null);
  let [vConsole, setVConsole] = useState<VConsole[]>([]);
  let [state, setState] = useState(State.initial);
  let [codeSrc, setCodeSrc] = useState<string | undefined>();
  const [isEmpty, setIsEmpty] = useState<boolean>(true);
  const subdomain = useRef<string>(crypto.randomUUID());
  const [initialContent, setInitialContent] = useState<EditorContent | null>(
    null
  );
  let { data: initialCode } = useSWRImmutable<EditorContent>(
    !shared && gistId ? `/api/v1/play/${encodeURIComponent(gistId)}` : null,
    async (url) => {
      const response = await fetch(url);

      if (!response.ok) {
        throw Error(response.statusText);
      }
      gleanClick(`${PLAYGROUND}: load-shared`);

      const code = await response.json();
      if (code) {
        setState(State.remote);
        return code;
      }
      return null;
    },
    {
      fallbackData:
        (!gistId && state === State.initial && load(SESSION_KEY)) || undefined,
    }
  );
  const htmlRef = useRef<EditorHandle | null>(null);
  const cssRef = useRef<EditorHandle | null>(null);
  const jsRef = useRef<EditorHandle | null>(null);
  const iframe = useRef<HTMLIFrameElement | null>(null);
  const diaRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    if (initialCode) {
      store(SESSION_KEY, initialCode);
      if (Object.values(initialCode).some(Boolean)) {
        setInitialContent(structuredClone(initialCode));
      }
    }
  }, [initialCode, setInitialContent]);

  const getEditorContent = useCallback(() => {
    const code = {
      html: htmlRef.current?.getContent() || HTML_DEFAULT,
      css: cssRef.current?.getContent() || CSS_DEFAULT,
      js: jsRef.current?.getContent() || JS_DEFAULT,
      src: initialCode?.src,
    };
    store(SESSION_KEY, code);
    return code;
  }, [initialCode?.src]);

  let messageListener = useCallback(
    ({ data: { typ, prop, message } }) => {
      if (typ === "console") {
        if (prop === "clear") {
          setVConsole([]);
        } else if (
          (prop === "log" || prop === "error" || prop === "warn") &&
          typeof message === "string"
        ) {
          setVConsole((vConsole) => [...vConsole, { prop, message }]);
        } else {
          const warning = "[Playground] Unsupported console message";
          setVConsole((vConsole) => [
            ...vConsole,
            {
              prop: "warn",
              message: `${warning} (see browser console)`,
            },
          ]);
          console.warn(warning, { prop, message });
        }
      } else if (typ === "ready") {
        updatePlayIframe(iframe.current, getEditorContent());
      }
    },
    [getEditorContent]
  );

  const setEditorContent = ({ html, css, js, src }: EditorContent) => {
    htmlRef.current?.setContent(html);
    cssRef.current?.setContent(css);
    jsRef.current?.setContent(js);
    if (src) {
      setCodeSrc(src.split("/").slice(0, -1).join("/"));
    }
    setIsEmpty(!html && !css && !js);
  };

  useEffect(() => {
    if (state === State.initial || state === State.remote) {
      if (initialCode && Object.values(initialCode).some(Boolean)) {
        setEditorContent(initialCode);
      } else {
        setEditorContent({
          html: HTML_DEFAULT,
          css: CSS_DEFAULT,
          js: JS_DEFAULT,
        });
      }
      setState(State.ready);
    }
  }, [initialCode, state]);

  useEffect(() => {
    window.addEventListener("message", messageListener);
    return () => {
      window.removeEventListener("message", messageListener);
    };
  }, [messageListener]);

  const clear = async () => {
    setSearchParams([], { replace: true });
    setCodeSrc(undefined);
    setEditorContent({ html: HTML_DEFAULT, css: CSS_DEFAULT, js: JS_DEFAULT });
    setInitialContent(null);

    updateWithEditorContent();
  };

  const reset = async () => {
    setEditorContent({
      html: initialContent?.html || HTML_DEFAULT,
      css: initialContent?.css || CSS_DEFAULT,
      js: initialContent?.js || JS_DEFAULT,
    });

    updateWithEditorContent();
  };

  const clearConfirm = async () => {
    if (window.confirm("Do you really want to clear everything?")) {
      gleanClick(`${PLAYGROUND}: reset-click`);
      await clear();
    }
  };

  const resetConfirm = async () => {
    if (window.confirm("Do you really want to revert your changes?")) {
      gleanClick(`${PLAYGROUND}: revert-click`);
      await reset();
    }
  };

  const updateWithEditorContent = () => {
    const { html, css, js } = getEditorContent();
    setIsEmpty(!html && !css && !js);

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

  const format = async () => {
    const { html, css, js } = getEditorContent();

    try {
      const formatted = {
        html: await prettier.format(html, {
          parser: "html",
          plugins: [
            prettierPluginHTML,
            prettierPluginCSS,
            prettierPluginBabel,
            prettierPluginESTree,
          ],
        }),
        css: await prettier.format(css, {
          parser: "css",
          plugins: [prettierPluginCSS],
        }),
        js: await prettier.format(js, {
          parser: "babel",
          plugins: [prettierPluginBabel, prettierPluginESTree],
        }),
      };
      setEditorContent(formatted);
    } catch (e) {
      console.error(e);
    }
  };
  const share = useCallback(async () => {
    const { url, id } = await save(getEditorContent());
    setSearchParams([["id", id]], { replace: true });
    setShared(true);
    setShareUrl(url);
  }, [setSearchParams, setShareUrl, setShared, getEditorContent]);

  // We're using a random subdomain for origin isolation.
  const src = new URL(
    `${window.location.protocol}//${
      PLAYGROUND_BASE_HOST.startsWith("localhost")
        ? ""
        : `${subdomain.current}.`
    }${PLAYGROUND_BASE_HOST}`
  );
  src.pathname = `${codeSrc || ""}/runner.html`;

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
            <h1>Playground</h1>
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
                isDisabled={isEmpty}
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
                isDisabled={isEmpty}
                id="clear"
                extraClasses="red"
                onClickHandler={clearConfirm}
              >
                clear
              </Button>
              {initialContent && (
                <Button
                  type="secondary"
                  id="reset"
                  extraClasses="red"
                  onClickHandler={resetConfirm}
                >
                  reset
                </Button>
              )}
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
            sandbox="allow-scripts allow-same-origin allow-forms"
          ></iframe>
          <Console vConsole={vConsole} />
          <SidePlacement />
        </section>
      </main>
    </>
  );
}
