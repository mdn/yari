import React, { useRef, useEffect, useState } from "react";
import { Link, useNavigate, LinkProps } from "react-router-dom";

interface PreloadingLinkProps extends LinkProps {
  delay?: number;
}

const prefetches = new Set<string>();

function preload(url: string) {
  if (prefetches.has(url)) {
    return;
  }

  const prefetcher = document.createElement("link");
  prefetcher.rel = "prefetch";
  prefetcher.href = url;
  document.head.appendChild(prefetcher);

  prefetches.add(url);
}

const DEFAULT_DELAY = 500;

const INJECT_WAITING_CLASSNAME = "preloading";
// const INJECT_NAVIGATING_CLASSNAME = "navigating";

let globalWaitingFor = 0;

function useClassname(initial: string) {
  const [current, setState] = useState<string[]>(initial.split(/\s/));
  // const add = (name: string) => {
  //   setState((state) => [...state, name]);
  // };
  // const remove = (name: string) => {
  //   setState((state) => state.filter((s) => s !== name));
  // };
  const toggle = (name: string) => {
    setState((state) => {
      if (state.includes(name)) {
        return state.filter((n) => n !== name);
      } else {
        return [...state, name];
      }
    });
  };
  return {
    className: current.join(" "),
    toggleClassName: toggle,
    // addClassName: add,
    // removeClassName: remove,
  };
}

export function PreloadingDocumentLink(props: PreloadingLinkProps) {
  const navigate = useNavigate();
  // const className = props.className;

  // let waitingFor: number;
  // const waitingFor = useRef(0);
  const mounted = useRef(true);
  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  const { className, toggleClassName } = useClassname(props.className || "");

  function isSupported() {
    const prefetchElement = document.createElement("link");
    return (
      prefetchElement.relList &&
      prefetchElement.relList.supports &&
      prefetchElement.relList.supports("prefetch") &&
      window.IntersectionObserver &&
      "isIntersecting" in IntersectionObserverEntry.prototype
    );
  }

  return (
    <Link
      {...props}
      className={className as string}
      onClick={(event) => {
        if (isSupported()) {
          if (globalWaitingFor) {
            window.clearTimeout(globalWaitingFor);
          }
          if (!prefetches.has(props.to + "/index.json")) {
            event.preventDefault();
            toggleClassName(INJECT_WAITING_CLASSNAME);

            const delay = props.delay || DEFAULT_DELAY;
            preload(props.to + "/index.json");

            globalWaitingFor = window.setTimeout(() => {
              if (mounted.current) {
                toggleClassName(INJECT_WAITING_CLASSNAME);
                // addClassName(INJECT_NAVIGATING_CLASSNAME);
                navigate(props.to);
              }
            }, delay);
          }
        }
      }}
    >
      {props.children}
    </Link>
  );
}
