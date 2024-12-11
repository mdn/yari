import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import useSWRImmutable from "swr/immutable";
import { Button } from "../ui/atoms/button";
import { ReactPlayEditor, PlayEditor } from "./editor";
import { SidePlacement } from "../ui/organisms/placement";
import {
  compressAndBase64Encode,
  decompressFromBase64,
  EditorContent,
  SESSION_KEY,
} from "./utils";

import "./index.scss";
import { PLAYGROUND_BASE_HOST } from "../env";
import { FlagForm, ShareForm } from "./forms";
import { Console, VConsole } from "./console";
import { useGleanClick } from "../telemetry/glean-context";
import { PLAYGROUND } from "../telemetry/constants";
import { useUIStatus } from "../ui-context";

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
  const { colorScheme } = useUIStatus();
  const gleanClick = useGleanClick();
  let [searchParams, setSearchParams] = useSearchParams();
  const gistId = searchParams.get("id");
  const stateParam = searchParams.get("state");
  let [dialogState, setDialogState] = useState(DialogState.none);
  let [shared, setShared] = useState(false);
  let [shareUrl, setShareUrl] = useState<URL | null>(null);
  let [vConsole, setVConsole] = useState<VConsole[]>([]);
  let [state, setState] = useState(State.initial);
  let [codeSrc, setCodeSrc] = useState<string | undefined>();
  let [iframeSrc, setIframeSrc] = useState("about:blank");
  const [isEmpty, setIsEmpty] = useState<boolean>(true);
  const subdomain = useRef<string>(crypto.randomUUID());
  const [initialContent, setInitialContent] = useState<EditorContent | null>(
    null
  );
  const [flipFlop, setFlipFlop] = useState(0);
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
  const htmlRef = useRef<PlayEditor | null>(null);
  const cssRef = useRef<PlayEditor | null>(null);
  const jsRef = useRef<PlayEditor | null>(null);
  const iframe = useRef<HTMLIFrameElement | null>(null);
  const diaRef = useRef<HTMLDialogElement | null>(null);

  const updateWithCode = useCallback(
    async (code: EditorContent) => {
      const { state } = await compressAndBase64Encode(JSON.stringify(code));

      // We're using a random subdomain for origin isolation.
      const url = new URL(
        window.location.hostname.endsWith("localhost")
          ? window.location.origin
          : `${window.location.protocol}//${
              PLAYGROUND_BASE_HOST.startsWith("localhost")
                ? ""
                : `${subdomain.current}.`
            }${PLAYGROUND_BASE_HOST}`
      );
      setVConsole([]);
      url.searchParams.set("state", state);
      // ensure iframe reloads even if code doesn't change
      url.searchParams.set("f", flipFlop.toString());
      url.pathname = `${codeSrc || code.src || ""}/runner.html`;
      setIframeSrc(url.href);
      // using an updater function causes the second "run" to not reload properly:
      setFlipFlop((flipFlop + 1) % 2);
    },
    [codeSrc, setVConsole, setIframeSrc, flipFlop, setFlipFlop]
  );

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
      html: htmlRef.current?.value || HTML_DEFAULT,
      css: cssRef.current?.value || CSS_DEFAULT,
      js: jsRef.current?.value || JS_DEFAULT,
      src: initialCode?.src || initialContent?.src,
    };
    store(SESSION_KEY, code);
    return code;
  }, [initialContent?.src, initialCode?.src]);

  let messageListener = useCallback(({ data: { typ, prop, message } }) => {
    if (typ === "console") {
      if (
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
    }
  }, []);

  const setEditorContent = ({ html, css, js, src }: EditorContent) => {
    if (htmlRef.current) {
      htmlRef.current.value = html;
    }
    if (cssRef.current) {
      cssRef.current.value = css;
    }
    if (jsRef.current) {
      jsRef.current.value = js;
    }
    if (src) {
      setCodeSrc(src);
    }
    setIsEmpty(!html && !css && !js);
  };

  useEffect(() => {
    (async () => {
      if (state === State.initial || state === State.remote) {
        if (initialCode && Object.values(initialCode).some(Boolean)) {
          setEditorContent(initialCode);
          if (!gistId) {
            // don't auto run shared code
            updateWithCode(initialCode);
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
  }, [initialCode, state, gistId, stateParam, updateWithCode]);

  useEffect(() => {
    window.addEventListener("message", messageListener);
    return () => {
      window.removeEventListener("message", messageListener);
    };
  }, [messageListener]);

  const clear = async () => {
    setSearchParams([], { replace: true });
    setCodeSrc(undefined);
    setInitialContent(null);
    setEditorContent({ html: HTML_DEFAULT, css: CSS_DEFAULT, js: JS_DEFAULT });

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
    const { html, css, js, src } = getEditorContent();
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
    updateWithCode({ html, css, js, src });
  };

  const format = async () => {
    try {
      await Promise.all([
        htmlRef.current?.format(),
        cssRef.current?.format(),
        jsRef.current?.format(),
      ]);
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
          <ReactPlayEditor
            ref={htmlRef}
            language="html"
            colorScheme={colorScheme}
            onUpdate={updateWithEditorContent}
          ></ReactPlayEditor>
          <ReactPlayEditor
            ref={cssRef}
            language="css"
            colorScheme={colorScheme}
            onUpdate={updateWithEditorContent}
          ></ReactPlayEditor>
          <ReactPlayEditor
            ref={jsRef}
            language="javascript"
            colorScheme={colorScheme}
            onUpdate={updateWithEditorContent}
          ></ReactPlayEditor>
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
            src={iframeSrc}
            sandbox="allow-scripts allow-same-origin allow-forms"
          ></iframe>
          <Console vConsole={vConsole} />
          <SidePlacement extraClasses={["horizontal"]} />
        </section>
      </main>
    </>
  );
}
