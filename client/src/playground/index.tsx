import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import useSWRImmutable from "swr/immutable";
import { Button } from "../ui/atoms/button";
import { SidePlacement } from "../ui/organisms/placement";
import { decompressFromBase64, EditorContent, SESSION_KEY } from "./utils";

import "./index.scss";
import { FlagForm, ShareForm } from "./forms";
import { PlayController, ReactPlayController } from "../lit/play/controller";
import { ReactPlayEditor } from "../lit/play/editor";
import { ReactPlayConsole } from "../lit/play/console";
import { ReactPlayRunner } from "../lit/play/runner";
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
  const stateParam = searchParams.get("state");
  let [dialogState, setDialogState] = useState(DialogState.none);
  let [shared, setShared] = useState(false);
  let [shareUrl, setShareUrl] = useState<URL | null>(null);
  let [state, setState] = useState(State.initial);
  const [isShareable, setIsShareable] = useState<boolean>(true);
  const [isClearable, setIsClearable] = useState<boolean>(true);
  const [initialContent, setInitialContent] = useState<EditorContent | null>(
    null
  );
  let { data: initialCode } = useSWRImmutable<EditorContent>(
    !stateParam && !shared && gistId
      ? `/api/v1/play/${encodeURIComponent(gistId)}`
      : null,
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
        (!stateParam &&
          !gistId &&
          state === State.initial &&
          load(SESSION_KEY)) ||
        undefined,
    }
  );
  const controller = useRef<PlayController | null>(null);
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
    return {
      html: controller.current?.code.html || HTML_DEFAULT,
      css: controller.current?.code.css || CSS_DEFAULT,
      js: controller.current?.code.js || JS_DEFAULT,
      src: initialCode?.src || initialContent?.src,
    };
  }, [initialContent?.src, initialCode?.src]);

  const setIsEmpty = useCallback((content: EditorContent) => {
    const { html, css, js } = content;
    setIsShareable(!html.trim() && !css.trim() && !js.trim());
    setIsClearable(!html && !css && !js);
  }, []);

  const setEditorContent = useCallback(
    (content: EditorContent) => {
      if (controller.current) {
        controller.current.code = { ...content };
        if (content.src) {
          controller.current.srcPrefix = content.src;
        }
        setIsEmpty(content);
        store(SESSION_KEY, content);
      }
    },
    [setIsEmpty]
  );

  useEffect(() => {
    (async () => {
      if (state === State.initial || state === State.remote) {
        if (initialCode && Object.values(initialCode).some(Boolean)) {
          setEditorContent(initialCode);
          if (!gistId) {
            // don't auto run shared code
            controller.current?.run();
          }
        } else if (stateParam) {
          try {
            let { state } = await decompressFromBase64(stateParam);
            let code = JSON.parse(state || "{}") as EditorContent;
            setEditorContent(code);
          } catch (e) {
            console.error(e);
          }
        } else {
          setEditorContent({
            html: HTML_DEFAULT,
            css: CSS_DEFAULT,
            js: JS_DEFAULT,
          });
        }
        setState(State.ready);
      }
    })();
  }, [initialCode, state, gistId, stateParam, setEditorContent]);

  const clear = async () => {
    setSearchParams([], { replace: true });
    setInitialContent(null);
    setEditorContent({
      html: HTML_DEFAULT,
      css: CSS_DEFAULT,
      js: JS_DEFAULT,
      src: undefined,
    });

    run();
  };

  const reset = async () => {
    setEditorContent({
      html: initialContent?.html || HTML_DEFAULT,
      css: initialContent?.css || CSS_DEFAULT,
      js: initialContent?.js || JS_DEFAULT,
    });

    run();
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

  const run = () => {
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
    controller.current?.run();
  };

  const format = async () => {
    await controller.current?.format();
  };

  const share = useCallback(async () => {
    const { url, id } = await save(getEditorContent());
    setSearchParams([["id", id]], { replace: true });
    setShared(true);
    setShareUrl(url);
  }, [setSearchParams, setShareUrl, setShared, getEditorContent]);

  const cleanDialog = () => {
    if (dialogState === DialogState.share) {
      setShareUrl(null);
    }
  };

  const onEditorUpdate = () => {
    const code = getEditorContent();
    setIsEmpty(code);
    store(SESSION_KEY, code);
  };

  return (
    <ReactPlayController ref={controller} runOnChange={true}>
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
              <Button type="secondary" id="run" onClickHandler={run}>
                run
              </Button>
              <Button
                type="secondary"
                id="share"
                isDisabled={isShareable}
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
                isDisabled={isClearable}
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
          <details className="editor-container" open={true}>
            <summary>HTML</summary>
            <ReactPlayEditor
              language="html"
              onUpdate={onEditorUpdate}
            ></ReactPlayEditor>
          </details>
          <details className="editor-container" open={true}>
            <summary>CSS</summary>
            <ReactPlayEditor
              language="css"
              onUpdate={onEditorUpdate}
            ></ReactPlayEditor>
          </details>
          <details className="editor-container" open={true}>
            <summary>JAVASCRIPT</summary>
            <ReactPlayEditor
              language="js"
              onUpdate={onEditorUpdate}
            ></ReactPlayEditor>
          </details>
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
          <ReactPlayRunner />
          <div id="play-console">
            <span>Console</span>
            <ReactPlayConsole />
          </div>
          <SidePlacement extraClasses={["horizontal"]} />
        </section>
      </main>
    </ReactPlayController>
  );
}
