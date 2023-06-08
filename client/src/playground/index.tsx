import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import useSWR from "swr";
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
import { useUserData } from "../user-context";
import { FlagForm, ShareForm } from "./forms";
import { Console, VConsole } from "./console";
import { useGleanClick } from "../telemetry/glean-context";

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

export default function Playground() {
  const gleanClick = useGleanClick();
  const userData = useUserData();
  let [searchParams] = useSearchParams();
  let gistId = searchParams.get("id");
  let sampleKey = searchParams.get("sample");
  let [diaSate, setDiaState] = useState(DialogState.none);
  let [shared, setShared] = useState(false);
  let [vConsole, setVConsole] = useState<VConsole[]>([]);
  let [state, setState] = useState(State.initial);
  let [codeSrc, setCodeSrc] = useState<string | undefined>();
  let { data: code } = useSWR<EditorContent>(
    !shared && gistId ? `/api/v1/play/${encodeURIComponent(gistId)}` : null,
    async (url) => {
      const response = await fetch(url);

      if (!response.ok) {
        throw Error(response.statusText);
      }

      return (await response.json()) || null;
    },
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      fallbackData:
        (!gistId &&
          sampleKey &&
          JSON.parse(sessionStorage.getItem(sampleKey) || "null")) ||
        undefined,
    }
  );
  let [unsafe, setUnsafe] = useState(Boolean(sampleKey && code && !gistId));
  const subdomain = useRef<string>(crypto.randomUUID());
  const htmlRef = useRef<EditorHandle | null>(null);
  const cssRef = useRef<EditorHandle | null>(null);
  const jsRef = useRef<EditorHandle | null>(null);
  const iframe = useRef<HTMLIFrameElement | null>(null);
  const shareDiaRef = useRef<HTMLDialogElement | null>(null);
  let messageListener = useCallback(({ data: { typ, prop, message } }) => {
    if (typ === "console") {
      if (prop === "clear") {
        setVConsole([]);
      } else {
        setVConsole((vConsole) => [...vConsole, { prop, message }]);
      }
    } else if (typ === "ready") {
      updatePlayIframe(iframe.current, getEditorContent());
    }
  }, []);
  useEffect(() => {
    if (state === State.initial) {
      if (code && Object.values(code).some(Boolean)) {
        htmlRef.current?.setContent(code?.html);
        cssRef.current?.setContent(code?.css);
        jsRef.current?.setContent(code?.js);
        setState(State.remote);
        if (code.src) {
          setCodeSrc(
            code?.src && `${code.src.split("/").slice(0, -1).join("/")}`
          );
        }
        if (sampleKey) {
          window.history.replaceState({}, "", "/en-US/play");
        }
      } else {
        htmlRef.current?.setContent(HTML_DEFAULT);
        cssRef.current?.setContent(CSS_DEFAULT);
        jsRef.current?.setContent(JS_DEFAULT);
      }
    }
  }, [code, state, sampleKey]);
  useEffect(() => {
    window.addEventListener("message", messageListener);
    return () => {
      window.removeEventListener("message", messageListener);
    };
  }, [messageListener]);
  const reset = async () => {
    window.history.replaceState({}, "", "/en-US/play");
    setCodeSrc(undefined);
    htmlRef.current?.setContent(HTML_DEFAULT);
    cssRef.current?.setContent(CSS_DEFAULT);
    jsRef.current?.setContent(JS_DEFAULT);

    updateWithEditorContent();
  };
  const resetConfirm = async () => {
    if (window.confirm("Do you really want to reset everything?")) {
      gleanClick("play->action: reset");
      await reset();
    }
  };

  const getEditorContent = () => {
    return {
      html: htmlRef.current?.getContent() || HTML_DEFAULT,
      css: cssRef.current?.getContent() || CSS_DEFAULT,
      js: jsRef.current?.getContent() || JS_DEFAULT,
    };
  };

  const updateWithEditorContent = () => {
    const loading = [
      { backgroundColor: "var(--button-bg)" },
      { backgroundColor: "var(--background-primary)", color: "red" },
      { backgroundColor: "var(--button-bg)" },
    ];

    const timing = {
      duration: 2000,
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
    window.history.replaceState(
      {},
      "",
      `/en-US/play?${url.searchParams.toString()}`
    );
    setShared(true);
    return url.toString();
  };
  const src = `${
    codeSrc ||
    `//${
      PLAYGROUND_BASE_URL.startsWith("localhost") ? "" : `${subdomain.current}.`
    }${PLAYGROUND_BASE_URL}`
  }/${unsafe ? "unsafe-" : ""}runner.html`;

  return (
    <>
      <main className="play container">
        <dialog id="playDialog" ref={shareDiaRef}>
          {diaSate === DialogState.flag && <FlagForm gistId={gistId} />}
          {diaSate === DialogState.share && (
            <ShareForm code={getEditorContent} share={share} />
          )}
        </dialog>
        <section className="editors">
          <aside>
            <Switch
              name="toggle-unsafe"
              checked={unsafe}
              toggle={(e) => setUnsafe(e.target.checked)}
            >
              Load remote content
            </Switch>
            <menu>
              <Button id="format" onClickHandler={format}>
                format
              </Button>
              <Button id="run" onClickHandler={updateWithEditorContent}>
                run
              </Button>
              {userData?.isAuthenticated && (
                <Button
                  id="share"
                  onClickHandler={() => {
                    setDiaState(DialogState.share);
                    shareDiaRef.current?.showModal();
                  }}
                >
                  share
                </Button>
              )}
              <Button
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
                setDiaState(DialogState.flag);
                shareDiaRef.current?.showModal();
              }}
            >
              Seeing something inappropriate?
            </button>
          )}
          <iframe
            title="runner"
            ref={iframe}
            src={src}
            sandbox="allow-scripts"
          ></iframe>
          <Console vConsole={vConsole} />
          <SidePlacement></SidePlacement>
        </section>
      </main>
    </>
  );
}
