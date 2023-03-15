import { useEffect } from "react";
import { useGleanClick } from "./glean-context";
import { IEX_DOMAIN } from "../env";

/**
 * Forwards user interactions with interactive-examples to Glean.
 */
export function useInteractiveExamplesActionHandler() {
  const gleanClick = useGleanClick();

  useEffect(() => {
    const listener = (event: MessageEvent) => {
      if (
        event.origin === IEX_DOMAIN &&
        typeof event.data === "object" &&
        event.data.type === "action"
      ) {
        gleanClick(`interactive-examples: ${event.data.source}`);
      }
    };

    window.addEventListener("message", listener);

    return () => window.removeEventListener("message", listener);
  }, [gleanClick]);
}
