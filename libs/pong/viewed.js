/* global fetch */
export function createPongViewedHandler(coder) {
  return async (params) => {
    const view = coder.decodeAndVerify(params.get("code"));
    const fallback = coder.decodeAndVerify(params.get("fallback"));
    fallback && (await fetch(`https:${fallback}`, { redirect: "manual" }));
    await fetch(view, { redirect: "manual" });
  };
}
