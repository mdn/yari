import { createSearchParams, URLSearchParamsInit } from "react-router-dom";

export function appendURL(
  searchParams: URLSearchParamsInit,
  overrides: Record<string, string | string[] | undefined>
) {
  const sp = createSearchParams(searchParams);
  Object.entries(overrides).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      sp.delete(key);
      value.forEach((v) => sp.append(key, v));
    } else if (value === undefined) {
      sp.delete(key);
    } else {
      sp.set(key, value);
    }
  });
  return sp;
}
