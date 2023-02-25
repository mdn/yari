import { SIDEBAR_CLICK } from "./constants";

export function handleSidebarClick(
  event: MouseEvent,
  record: (source: string) => void
) {
  const payload = getClickPayload(event);
  if (payload) {
    record(`${SIDEBAR_CLICK}: ${payload.macro} ${payload.href}`);
  }
}

function getClickPayload(event: MouseEvent) {
  const { target = null } = event;
  const anchor = (target as HTMLElement)?.closest("a");

  if (!anchor) {
    return null;
  }

  if (anchor.closest(".document-toc")) {
    return null;
  }

  const sidebar = document.getElementById("sidebar-quicklinks");

  if (!sidebar) {
    return null;
  }

  const macro = sidebar.getAttribute("data-macro") ?? "?";
  const href = anchor.getAttribute("href") ?? "?";

  return {
    macro,
    href,
  };
}
