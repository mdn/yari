/* global fetch */
export function makePongClickHandler(CODER) {
  return async (params) => {
    const click = CODER.decodeAndVerify(params.get("code"));
    const fallback = CODER.decodeAndVerify(params.get("fallback"));
    const res = await fetch(click, { redirect: "manual" });
    let status = res.status;
    let headers = res.headers;
    if (fallback) {
      const fallbackRes = await fetch(`https:${fallback}`, {
        redirect: "manual",
      });
      status = fallbackRes.status;
      headers = fallbackRes.headers;
    }
    return { status, location: headers.get("location") };
  };
}
