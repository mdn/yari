import { useUserData } from "../../user-context";

export function isExternalUrl(url: string) {
  return url.startsWith("//") || !url.startsWith("/");
}

export function useAIHelpSettings() {
  const user = useUserData();
  const isHistoryEnabled = user?.settings?.aiHelpHistory ?? false;

  return {
    isHistoryEnabled,
  };
}
