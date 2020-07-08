import { useParams } from "react-router-dom";

export function useLocale() {
  return useParams().locale || "en-US";
}
