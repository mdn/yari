import { useUserData } from "../../user-context";

export function isExternalUrl(url: string) {
  return !isInternalUrl(url);
}

export function isInternalUrl(url: string) {
  return (
    !url.startsWith("//") &&
    (url.startsWith("/") || url.startsWith("https://developer.mozilla.org/"))
  );
}

export function useAIHelpSettings() {
  const user = useUserData();
  const isHistoryEnabled = user?.settings?.aiHelpHistory ?? false;

  return {
    isHistoryEnabled,
  };
}
