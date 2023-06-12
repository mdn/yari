import { useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { keymap, highlightActiveLine, lineNumbers } from "@codemirror/view";
import { EditorState, StateEffect } from "@codemirror/state";
import { indentOnInput, bracketMatching } from "@codemirror/language";
import { defaultKeymap, indentWithTab } from "@codemirror/commands";
import {
  autocompletion,
  completionKeymap,
  closeBrackets,
  closeBracketsKeymap,
} from "@codemirror/autocomplete";
import { lintKeymap } from "@codemirror/lint";
import { EditorView, minimalSetup } from "codemirror";
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

function cmExtensions() {
  return [
    minimalSetup,
    lineNumbers(),
    indentOnInput(),
    bracketMatching(),
    closeBrackets(),
    autocompletion(),
    highlightActiveLine(),
    keymap.of([
      ...closeBracketsKeymap,
      ...defaultKeymap,
      ...completionKeymap,
      ...lintKeymap,
      indentWithTab,
    ]),
  ];
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
      ...cmExtensions(),
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
              ...cmExtensions(),
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
