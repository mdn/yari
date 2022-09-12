const KS_RE = /{{([^}]*)}}/g;

export function encodeKS(raw) {
  return raw.replace(
    KS_RE,
    (_, ks) => `{{${Buffer.from(ks).toString("base64")}}}`
  );
}

export function decodeKS(raw) {
  return raw.replace(
    KS_RE,
    (_, ks) => `{{${Buffer.from(ks, "base64").toString()}}}`
  );
}

export default {
  encodeKS,
  decodeKS,
};
