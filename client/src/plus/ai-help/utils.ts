import { useUserData } from "../../user-context";

export function isExternalUrl(url: string) {
  return url.startsWith("//") || !url.startsWith("/");
}

export function useAiHelpSettings() {
  const user = useUserData();
  const isHistoryEnabled = user?.settings?.aiHelpHistory ?? false;

  return {
    isHistoryEnabled,
  };
}
