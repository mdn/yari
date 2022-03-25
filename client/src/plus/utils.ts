import { useLocation } from "react-router-dom";
import { useLocale } from "../hooks";

export function usePlusUrl() {
  const { pathname } = useLocation();
  const locale = useLocale();

  function normalizedUrl(url: string): string {
    return url.replace(/\/$/, "").toLowerCase();
  }

  let target = `/${locale}/plus/`;

  if (normalizedUrl(target) === normalizedUrl(pathname)) {
    target = "#subscribe";
  }

  return target;
}
