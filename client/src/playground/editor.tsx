import { useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { EditorView, basicSetup } from "codemirror";
import { EditorState, StateEffect } from "@codemirror/state";
import { javascript } from "@codemirror/lang-javascript";
import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { oneDark } from "@codemirror/theme-one-dark";
import { useUIStatus } from "../ui-context";

// @ts-ignore
// eslint-disable-next-line no-restricted-globals
self.MonacoEnvironment = {
  getWorkerUrl: function (_moduleId: any, label: string) {
    if (label === "json") {
      return "./json.worker.js";
    }
    if (label === "css" || label === "scss" || label === "less") {
      return "./css.worker.js";
    }
    if (label === "html" || label === "handlebars" || label === "razor") {
      return "./html.worker.js";
    }
    if (label === "typescript" || label === "javascript") {
      return "./ts.worker.js";
    }
    return "./editor.worker.js";
  },
};

function lang(language) {
  switch (language) {
    case "javascript":
      return [javascript()];
    case "html":
      return [html()];
    case "css":
      return [css()];
    default:
      return [];
  }
}

export interface EditorHandle {
  getContent(): string | undefined;
  setContent(content: string): void;
}

const Editor = forwardRef<EditorHandle, any>(function EditorInner(
  {
    language,
    callback = () => {},
  }: {
    language: string;
    callback: () => void;
  },
  ref
) {
  const { colorScheme } = useUIStatus();
  const timer = useRef<number | null>(null);
  const divEl = useRef<HTMLDivElement>(null);
  let editor = useRef<EditorView | null>(null);
  const updateListenerExtension = useRef(
    EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        if (timer.current !== null && timer.current !== -1) {
          clearTimeout(timer.current);
        }
        timer.current = window?.setTimeout(() => {
          timer.current = -1;
          callback();
        }, 1000);
      }
    })
  );
  useEffect(() => {
    const extensions = [
      basicSetup,
      updateListenerExtension.current,
      EditorView.lineWrapping,
      ...(colorScheme === "dark" ? [oneDark] : []),
      ...lang(language),
    ];
    if (divEl.current && editor.current === null) {
      let startState = EditorState.create({
        extensions,
      });
      editor.current = new EditorView({
        state: startState,
        parent: divEl.current,
      });
    } else {
      editor.current?.dispatch({
        effects: StateEffect.reconfigure.of(extensions),
      });
    }
    return () => {};
  }, [language, colorScheme]);

  useImperativeHandle(
    ref,
    () => {
      return {
        getContent() {
          return editor.current?.state.doc.toString();
        },
        setContent(content: string) {
          let state = EditorState.create({
            doc: content,
            extensions: [
              basicSetup,
              updateListenerExtension.current,
              EditorView.lineWrapping,
              ...(colorScheme === "dark" ? [oneDark] : []),
              ...lang(language),
            ],
          });
          editor.current?.setState(state);
        },
      };
    },
    [language, colorScheme]
  );
  return (
    <details className="editor-container" open={true}>
      <summary>{language.toUpperCase()}</summary>
      <div className="editor" ref={divEl}></div>
    </details>
  );
});

export default Editor;
