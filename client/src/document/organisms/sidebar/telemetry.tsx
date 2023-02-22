import { useCallback, useRef } from "react";

import { SIDEBAR_CLICK } from "../../../telemetry/constants";
import { useGleanClick } from "../../../telemetry/glean-context";

export function useSidebarMetricsCallback() {
  const gleanClick = useGleanClick();
  const cleanupFunc = useRef<Function | null>(null);

  return useCallback(
    (ref: HTMLElement | null) => {
      if (cleanupFunc.current) {
        cleanupFunc.current();
        cleanupFunc.current = null;
      }

      if (ref) {
        cleanupFunc.current = registerSidebarMetricsListener(ref, gleanClick);
      }
    },
    [gleanClick]
  );
}

function registerSidebarMetricsListener(
  ref: HTMLElement,
  gleanClick: ReturnType<typeof useGleanClick>
): Function | null {
  const clickListener = (event: MouseEvent) => {
    handleSidebarClick(event, gleanClick);
  };

  ref.addEventListener("click", clickListener);

  return () => ref.removeEventListener("click", clickListener);
}

function handleSidebarClick(
  event: MouseEvent,
  gleanClick: (source: string) => void
) {
  const payload = getClickPayload(event);
  if (payload) {
    const key = `${SIDEBAR_CLICK}: ${JSON.stringify(payload)}`;
    gleanClick(key);
    console.log({ key, length: key.length });
  }
}

function getClickPayload(event: MouseEvent) {
  const { target = null } = event;
  const anchor = (target as HTMLElement)?.closest("a");
  const sidebar = document.getElementById("sidebar-quicklinks");

  if (sidebar && anchor && sidebar.contains(anchor)) {
    const currentPage = sidebar.querySelector(
      "a[aria-current=page]"
    ) as HTMLElement | null;

    const macro = sidebar.getAttribute("data-macro") ?? "?";
    const from = currentPage?.getAttribute("href") ?? window.location.pathname;
    const to = getCanonicalSlug(anchor?.getAttribute("href") ?? "?");

    const lineDistance = getLineDistance(currentPage, anchor);
    const slugDistance = getSlugDistance(from, to);
    const treeDistance = getTreeDistance(currentPage, anchor, {
      boundary: sidebar,
      selector: "details",
    });
    const current = currentPage
      ? isElementInViewport(currentPage)
        ? 1
        : 0
      : -1;

    return {
      line_dist: lineDistance,
      slug_dist: slugDistance,
      tree_dist: treeDistance,
      current,
      macro,
      to,
    };
  } else {
    return null;
  }
}

function getBaseFontSize(): number {
  return (
    Number(
      window
        ?.getComputedStyle(document.body)
        .getPropertyValue("font-size")
        .match(/\d+/)
    ) || 16
  );
}

export function getLineDistance(
  a: HTMLElement | null,
  b: HTMLElement | null
): number {
  if (!a || !b) {
    return -1;
  }

  const { top: aTop, bottom: aBottom } = a.getBoundingClientRect();
  const { top: bTop, bottom: bBottom } = b.getBoundingClientRect();

  const px = aTop < bTop ? bBottom - aTop : aBottom - bTop;
  const rem = px / getBaseFontSize();

  return Math.round(rem);
}

function getTreePath(
  element: HTMLElement,
  { boundary, selector }: { boundary: HTMLElement; selector: string }
): HTMLElement[] {
  const path: HTMLElement[] = [];

  let current: HTMLElement | null = element;
  while (current && boundary.contains(current)) {
    path.push(current);
    current = (current.parentNode as HTMLElement)?.closest(selector);
  }

  return path.reverse();
}

function getPathDistance<T>(a: T[], b: T[]): number {
  while (a.length && b.length && a[0] === b[0]) {
    // Remove common ancestors.
    a.shift();
    b.shift();
  }

  let distance = a.length + b.length;

  if (a.length && b.length) {
    // No parent-child relationship, so remove one edge to get the path length.
    distance--;
  }

  return distance;
}

export function getTreeDistance(
  a: HTMLElement | null,
  b: HTMLElement | null,
  { boundary, selector }: { boundary: HTMLElement; selector: string }
): number {
  if (!a || !b) {
    return -1;
  }
  if (a === b) {
    return 0;
  }

  const aPath = getTreePath(a, { boundary, selector });
  const bPath = getTreePath(b, { boundary, selector });

  return getPathDistance(aPath, bPath);
}

export function getCanonicalSlug(url: string) {
  return url.replace(/.*\/docs\//, "");
}

function getSlugPath(slug: string): string[] {
  return getCanonicalSlug(slug).split("/");
}

export function getSlugDistance(a: string | null, b: string | null) {
  if (!a || !b) {
    return -1;
  } else if (a === b) {
    return 0;
  }

  const aPath = getSlugPath(a);
  const bPath = getSlugPath(b);

  return getPathDistance(aPath, bPath);
}

export function isElementInViewport(el: HTMLElement) {
  var rect = el.getBoundingClientRect();

  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}
