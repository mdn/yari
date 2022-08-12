const KS_RE = /{{([^}]*)}}/g;

function encodeKS(raw) {
  return raw.replace(
    KS_RE,
    (_, ks) => `{{${Buffer.from(ks).toString("base64")}}}`
  );
}

function decodeKS(raw) {
  return raw.replace(
    KS_RE,
    (_, ks) => `{{${Buffer.from(ks, "base64").toString()}}}`
  );
}

module.exports = {
  encodeKS,
  decodeKS,
};
